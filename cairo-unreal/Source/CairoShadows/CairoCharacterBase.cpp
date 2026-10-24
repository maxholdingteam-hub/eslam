#include "CairoCharacterBase.h"
#include "CairoGameMode.h"
#include "Components/CapsuleComponent.h"
#include "Components/SkeletalMeshComponent.h"
#include "GameFramework/CharacterMovementComponent.h"
#include "Animation/AnimInstance.h"
#include "Animation/AnimMontage.h"

ACairoCharacterBase::ACairoCharacterBase()
{
	PrimaryActorTick.bCanEverTick = true;
	GetCharacterMovement()->bOrientRotationToMovement = true;
	GetCharacterMovement()->RotationRate = FRotator(0.f, 600.f, 0.f);
	bUseControllerRotationYaw = false;
}

void ACairoCharacterBase::BeginPlay()
{
	Super::BeginPlay();
	Health = MaxHealth;
	MeshRelativeTransform = GetMesh()->GetRelativeTransform();
}

float ACairoCharacterBase::PlayMontageSafe(UAnimMontage* Montage, float Rate)
{
	if (!Montage || !GetMesh()) return 0.f;
	if (UAnimInstance* Anim = GetMesh()->GetAnimInstance())
	{
		return Anim->Montage_Play(Montage, Rate);
	}
	return 0.f;
}

void ACairoCharacterBase::ApplyHit(ACairoCharacterBase* Attacker, float Damage, float StunAmount, bool bHeavy)
{
	if (bDead) return;
	Health -= Damage;
	Stun = FMath::Min(MaxStun, Stun + StunAmount);
	OnHitTaken(Damage, bHeavy);
	if (Health <= 0.f)
	{
		Die(Attacker, false);
		return;
	}
	PlayMontageSafe(HitReactMontage);
}

void ACairoCharacterBase::Die(ACairoCharacterBase* Killer, bool bSilent)
{
	if (bDead) return;
	bDead = true;
	Health = 0.f;
	GetCharacterMovement()->DisableMovement();
	GetCapsuleComponent()->SetCollisionEnabled(ECollisionEnabled::NoCollision);

	if (DeathMontage && !bSilent)
	{
		PlayMontageSafe(DeathMontage);
	}
	// الجثة بتقع رجدول (فيزياء)
	GetMesh()->SetCollisionProfileName(TEXT("Ragdoll"));
	GetMesh()->SetSimulatePhysics(true);

	OnDied();
	if (ACairoGameMode* GM = GetWorld()->GetAuthGameMode<ACairoGameMode>())
	{
		GM->NotifyCharacterKilled(this, Killer, bSilent);
	}
}

FVector ACairoCharacterBase::GetBodyLocation() const
{
	if (bDead && GetMesh() && GetMesh()->DoesSocketExist(TEXT("pelvis")))
	{
		return GetMesh()->GetSocketLocation(TEXT("pelvis"));
	}
	return GetActorLocation();
}

void ACairoCharacterBase::PrepareForCarry(USceneComponent* AttachTo, FName Socket)
{
	bBodyCarried = true;
	GetMesh()->SetSimulatePhysics(false);
	GetMesh()->SetCollisionEnabled(ECollisionEnabled::NoCollision);
	GetMesh()->AttachToComponent(GetCapsuleComponent(), FAttachmentTransformRules::KeepWorldTransform);
	GetMesh()->SetRelativeTransform(MeshRelativeTransform);
	AttachToComponent(AttachTo, FAttachmentTransformRules::SnapToTargetNotIncludingScale, Socket);
	// على الكتف: الجسم نايم بالعرض
	GetMesh()->SetRelativeRotation(MeshRelativeTransform.GetRotation().Rotator() + FRotator(0.f, 0.f, 90.f));
}

void ACairoCharacterBase::DropBody(const FVector& Location, bool bHideInSpot)
{
	bBodyCarried = false;
	DetachFromActor(FDetachmentTransformRules::KeepWorldTransform);
	SetActorLocation(Location);
	GetMesh()->SetRelativeTransform(MeshRelativeTransform);
	if (bHideInSpot)
	{
		bBodyHidden = true;
		SetActorHiddenInGame(true);
		return;
	}
	GetMesh()->SetCollisionProfileName(TEXT("Ragdoll"));
	GetMesh()->SetSimulatePhysics(true);
}
