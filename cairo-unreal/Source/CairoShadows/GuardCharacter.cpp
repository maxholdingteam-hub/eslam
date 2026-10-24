#include "GuardCharacter.h"
#include "GuardAIController.h"
#include "CairoGameMode.h"
#include "CairoPlayerCharacter.h"
#include "ArrowProjectile.h"
#include "Components/WidgetComponent.h"
#include "GameFramework/CharacterMovementComponent.h"
#include "Kismet/GameplayStatics.h"
#include "TimerManager.h"

#define LOCTEXT_NAMESPACE "Cairo"

AGuardCharacter::AGuardCharacter()
{
	AIControllerClass = AGuardAIController::StaticClass();
	AutoPossessAI = EAutoPossessAI::PlacedInWorldOrSpawned;
	GetCharacterMovement()->MaxWalkSpeed = 140.f;
	GetCharacterMovement()->bOrientRotationToMovement = true;

	StatusWidget = CreateDefaultSubobject<UWidgetComponent>(TEXT("StatusWidget"));
	StatusWidget->SetupAttachment(RootComponent);
	StatusWidget->SetRelativeLocation(FVector(0.f, 0.f, 135.f));
	StatusWidget->SetWidgetSpace(EWidgetSpace::Screen);
	StatusWidget->SetDrawSize(FVector2D(120.f, 60.f));
}

void AGuardCharacter::BeginPlay()
{
	Super::BeginPlay();
	if (bIsTarget)
	{
		MaxHealth = Health = 40.f;
		Tags.AddUnique(TEXT("Target"));
	}
	if (bIsArcher) MaxHealth = Health = 60.f;
}

void AGuardCharacter::Tick(float DeltaSeconds)
{
	Super::Tick(DeltaSeconds);
	if (bDead) return;
	const float Now = GetWorld()->GetTimeSeconds();
	if (State == EGuardState::Stunned && Now > StunEndTime)
	{
		Stun = 0.f;
		State = EGuardState::Alert;
	}
	// التوازن بيرجع ببطء لو مابقاش بيتضرب
	if (State != EGuardState::Stunned && Now > StaggerEndTime + 2.5f) Stun = FMath::Max(0.f, Stun - 8.f * DeltaSeconds);
}

void AGuardCharacter::ApplyHit(ACairoCharacterBase* Attacker, float Damage, float StunAmount, bool bHeavy)
{
	if (bDead || bCinematicLock) return;
	const float Now = GetWorld()->GetTimeSeconds();
	if (bIsTarget)
	{
		Super::ApplyHit(Attacker, Damage, 0.f, bHeavy);
		if (AGuardAIController* C = Cast<AGuardAIController>(GetController())) C->StartFlee();
		return;
	}
	if (State == EGuardState::Stunned)
	{
		Super::ApplyHit(Attacker, Damage * 1.5f, 0.f, bHeavy);
		return;
	}
	const bool bBlocks = State == EGuardState::Alert && !bWindingUp && !bIsArcher && FMath::FRand() < (bHeavy ? 0.1f : BlockChance);
	if (bBlocks)
	{
		Stun = FMath::Min(MaxStun, Stun + StunAmount * 0.6f);
		PlayMontageSafe(BlockMontage);
	}
	else
	{
		Health -= Damage;
		Stun = FMath::Min(MaxStun, Stun + StunAmount);
		OnHitTaken(Damage, bHeavy);
		if (Health <= 0.f) { Die(Attacker, false); return; }
		const bool bInterrupt = bHeavy || (!bHeavyWindup && FMath::FRand() < 0.3f);
		if (!bWindingUp || bInterrupt)
		{
			StaggerEndTime = Now + (bHeavy ? 0.6f : 0.16f);
			PlayMontageSafe(HitReactMontage);
		}
		if (bInterrupt && bWindingUp)
		{
			bWindingUp = false;
			GetWorldTimerManager().ClearTimer(AttackTimer);
			if (ACairoGameMode* GM = GetWorld()->GetAuthGameMode<ACairoGameMode>()) GM->ReleaseAttackToken();
		}
		// بعد ٣ ضربات ورا بعض بيرد على طول
		if (++HitStreak >= 3) { HitStreak = 0; NextAttackTime = 0.f; }
	}
	StaggerEndTime = FMath::Max(StaggerEndTime, Now);
	if (AGuardAIController* C = Cast<AGuardAIController>(GetController())) C->OnDamaged(Attacker);
	if (Stun >= MaxStun) EnterStun();
}

void AGuardCharacter::EnterStun()
{
	State = EGuardState::Stunned;
	StunEndTime = GetWorld()->GetTimeSeconds() + StunnedDuration;
	if (bWindingUp)
	{
		bWindingUp = false;
		GetWorldTimerManager().ClearTimer(AttackTimer);
		if (ACairoGameMode* GM = GetWorld()->GetAuthGameMode<ACairoGameMode>()) GM->ReleaseAttackToken();
	}
	PlayMontageSafe(StunnedMontage);
	Bark(LOCTEXT("Stunned", "آه…"));
}

void AGuardCharacter::OnParried()
{
	Stun = FMath::Min(MaxStun, Stun + 60.f);
	StaggerEndTime = GetWorld()->GetTimeSeconds() + 0.8f;
	PlayMontageSafe(HitReactMontage);
	if (Stun >= MaxStun) EnterStun();
}

void AGuardCharacter::BeginAttack()
{
	if (bDead || bWindingUp || State != EGuardState::Alert) return;
	const float Now = GetWorld()->GetTimeSeconds();
	if (Now < StaggerEndTime) return;
	bWindingUp = true;
	bHeavyWindup = FMath::FRand() < HeavyChance;
	PlayMontageSafe(WindupMontage);
	GetWorldTimerManager().SetTimer(AttackTimer, this, &AGuardCharacter::ResolveAttack, bHeavyWindup ? HeavyWindupTime : WindupTime, false);
}

void AGuardCharacter::ResolveAttack()
{
	if (ACairoGameMode* GM = GetWorld()->GetAuthGameMode<ACairoGameMode>()) GM->ReleaseAttackToken();
	if (!bWindingUp || bDead) return;
	bWindingUp = false;
	PlayMontageSafe(bHeavyWindup ? HeavyAttackMontage : AttackMontage);
	NextAttackTime = GetWorld()->GetTimeSeconds() + 1.2f + FMath::FRand() * 1.8f;
	ACairoPlayerCharacter* P = Cast<ACairoPlayerCharacter>(UGameplayStatics::GetPlayerCharacter(this, 0));
	if (!P) return;
	FVector D = P->GetActorLocation() - GetActorLocation();
	if (FMath::Abs(D.Z) > 110.f) return;
	D.Z = 0.f;
	if (D.Size() > AttackRange + 30.f || FVector::DotProduct(D.GetSafeNormal(), GetActorForwardVector()) < 0.6f) return;
	P->ReceiveEnemyAttack(this, bHeavyWindup ? HeavyDamage : LightDamage, bHeavyWindup);
}

void AGuardCharacter::FireArrow(AActor* Target)
{
	if (!Target) return;
	PlayMontageSafe(ShootMontage);
	const FVector From = GetActorLocation() + FVector(0, 0, 60.f) + GetActorForwardVector() * 50.f;
	FVector Aim = Target->GetActorLocation() + Target->GetVelocity() * 0.3f + FVector(0, 0, 20.f);
	FActorSpawnParameters SP;
	SP.Owner = this;
	SP.Instigator = this;
	SP.SpawnCollisionHandlingOverride = ESpawnActorCollisionHandlingMethod::AlwaysSpawn;
	UClass* Cls = ArrowClass ? ArrowClass.Get() : AArrowProjectile::StaticClass();
	GetWorld()->SpawnActor<AArrowProjectile>(Cls, From, (Aim - From).Rotation(), SP);
}

void AGuardCharacter::LockForCinematic(AActor* Killer)
{
	bCinematicLock = true;
	bWindingUp = false;
	GetWorldTimerManager().ClearTimer(AttackTimer);
	if (AGuardAIController* C = Cast<AGuardAIController>(GetController())) C->StopMovement();
	FVector D = Killer->GetActorLocation() - GetActorLocation(); D.Z = 0.f;
	if (State == EGuardState::Stunned) SetActorRotation(D.Rotation()); // الإعدام وش لوش
}

void AGuardCharacter::Die(ACairoCharacterBase* Killer, bool bSilent)
{
	if (bWindingUp)
	{
		bWindingUp = false;
		GetWorldTimerManager().ClearTimer(AttackTimer);
		if (ACairoGameMode* GM = GetWorld()->GetAuthGameMode<ACairoGameMode>()) GM->ReleaseAttackToken();
	}
	State = EGuardState::Dead;
	StatusWidget->SetVisibility(false);
	if (AController* C = GetController()) C->UnPossess();
	Super::Die(Killer, bSilent);
}

#undef LOCTEXT_NAMESPACE
