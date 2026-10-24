#include "CairoPlayerCharacter.h"
#include "CairoShadows.h"
#include "CairoGameMode.h"
#include "CairoHUDWidget.h"
#include "GuardCharacter.h"
#include "HidingSpot.h"
#include "ViewPoint.h"
#include "Camera/CameraComponent.h"
#include "GameFramework/SpringArmComponent.h"
#include "GameFramework/CharacterMovementComponent.h"
#include "Components/CapsuleComponent.h"
#include "EnhancedInputComponent.h"
#include "EnhancedInputSubsystems.h"
#include "InputMappingContext.h"
#include "InputAction.h"
#include "InputModifiers.h"
#include "Kismet/GameplayStatics.h"
#include "Engine/World.h"
#include "EngineUtils.h"
#include "TimerManager.h"
#include "Blueprint/UserWidget.h"

#define LOCTEXT_NAMESPACE "Cairo"

namespace
{
	float SmoothStep(float T) { T = FMath::Clamp(T, 0.f, 1.f); return T * T * (3.f - 2.f * T); }
}

ACairoPlayerCharacter::ACairoPlayerCharacter()
{
	GetCapsuleComponent()->InitCapsuleSize(35.f, 90.f);

	CameraBoom = CreateDefaultSubobject<USpringArmComponent>(TEXT("CameraBoom"));
	CameraBoom->SetupAttachment(RootComponent);
	CameraBoom->TargetArmLength = 420.f;
	CameraBoom->SocketOffset = FVector(0.f, 55.f, 60.f);
	CameraBoom->bUsePawnControlRotation = true;
	CameraBoom->bEnableCameraLag = true;
	CameraBoom->CameraLagSpeed = 12.f;
	CameraBoom->ProbeSize = 14.f;

	FollowCamera = CreateDefaultSubobject<UCameraComponent>(TEXT("FollowCamera"));
	FollowCamera->SetupAttachment(CameraBoom, USpringArmComponent::SocketName);
	FollowCamera->bUsePawnControlRotation = false;
	FollowCamera->PostProcessBlendWeight = 1.f;

	UCharacterMovementComponent* Move = GetCharacterMovement();
	Move->MaxWalkSpeed = JogSpeed;
	Move->JumpZVelocity = 620.f;
	Move->AirControl = 0.25f;
	Move->GravityScale = 2.0f;
	Move->MaxFlySpeed = ClimbSpeed;
	Move->BrakingDecelerationFlying = 4000.f;
	Move->MaxStepHeight = 40.f;
	Move->SetWalkableFloorAngle(50.f);
}

void ACairoPlayerCharacter::BeginPlay()
{
	Super::BeginPlay();
	Stamina = MaxStamina;
	if (EagleOutlineMaterial)
	{
		FollowCamera->PostProcessSettings.WeightedBlendables.Array.Add(FWeightedBlendable(0.f, EagleOutlineMaterial));
	}
}

float ACairoPlayerCharacter::RealTime() const { return GetWorld()->GetRealTimeSeconds(); }

// ---------------- الإدخال ----------------
static UInputAction* MakeAction(UObject* Outer, FName Name, EInputActionValueType Type)
{
	UInputAction* A = NewObject<UInputAction>(Outer, Name);
	A->ValueType = Type;
	return A;
}

void ACairoPlayerCharacter::BuildDefaultInput()
{
	// كل الأزرار بتتعمل من الكود عشان ماتحتاجش تعمل ملفات إدخال بإيدك
	if (!MoveAction) MoveAction = MakeAction(this, TEXT("IA_Move"), EInputActionValueType::Axis2D);
	if (!LookAction) LookAction = MakeAction(this, TEXT("IA_Look"), EInputActionValueType::Axis2D);
	if (!JumpAction) JumpAction = MakeAction(this, TEXT("IA_Jump"), EInputActionValueType::Boolean);
	if (!SprintAction) SprintAction = MakeAction(this, TEXT("IA_Sprint"), EInputActionValueType::Boolean);
	if (!AttackAction) AttackAction = MakeAction(this, TEXT("IA_Attack"), EInputActionValueType::Boolean);
	if (!HeavyAction) HeavyAction = MakeAction(this, TEXT("IA_Heavy"), EInputActionValueType::Boolean);
	if (!ParryAction) ParryAction = MakeAction(this, TEXT("IA_Parry"), EInputActionValueType::Boolean);
	if (!DodgeAction) DodgeAction = MakeAction(this, TEXT("IA_Dodge"), EInputActionValueType::Boolean);
	if (!ContextAction) ContextAction = MakeAction(this, TEXT("IA_Context"), EInputActionValueType::Boolean);
	if (!EagleAction) EagleAction = MakeAction(this, TEXT("IA_Eagle"), EInputActionValueType::Boolean);
	if (MappingContext) return;

	MappingContext = NewObject<UInputMappingContext>(this, TEXT("IMC_Cairo"));
	UInputMappingContext* C = MappingContext;
	auto Swizzle = [this]() { UInputModifierSwizzleAxis* S = NewObject<UInputModifierSwizzleAxis>(this); S->Order = EInputAxisSwizzle::YXZ; return S; };
	auto Negate = [this](bool X, bool Y) { UInputModifierNegate* N = NewObject<UInputModifierNegate>(this); N->bX = X; N->bY = Y; N->bZ = false; return N; };

	C->MapKey(MoveAction, EKeys::W).Modifiers.Add(Swizzle());
	{ FEnhancedActionKeyMapping& M = C->MapKey(MoveAction, EKeys::S); M.Modifiers.Add(Swizzle()); M.Modifiers.Add(Negate(true, true)); }
	C->MapKey(MoveAction, EKeys::D);
	C->MapKey(MoveAction, EKeys::A).Modifiers.Add(Negate(true, true));
	C->MapKey(MoveAction, EKeys::Gamepad_Left2D);
	C->MapKey(LookAction, EKeys::Mouse2D).Modifiers.Add(Negate(false, true));
	C->MapKey(LookAction, EKeys::Gamepad_Right2D).Modifiers.Add(Negate(false, true));
	C->MapKey(JumpAction, EKeys::SpaceBar);           C->MapKey(JumpAction, EKeys::Gamepad_FaceButton_Bottom);
	C->MapKey(SprintAction, EKeys::LeftShift);        C->MapKey(SprintAction, EKeys::Gamepad_RightTrigger);
	C->MapKey(AttackAction, EKeys::LeftMouseButton);  C->MapKey(AttackAction, EKeys::Gamepad_RightShoulder);
	C->MapKey(HeavyAction, EKeys::RightMouseButton);  C->MapKey(HeavyAction, EKeys::Gamepad_LeftTrigger);
	C->MapKey(ParryAction, EKeys::Q);                 C->MapKey(ParryAction, EKeys::Gamepad_LeftShoulder);
	C->MapKey(DodgeAction, EKeys::C);                 C->MapKey(DodgeAction, EKeys::Gamepad_FaceButton_Right);
	C->MapKey(ContextAction, EKeys::F);               C->MapKey(ContextAction, EKeys::E); C->MapKey(ContextAction, EKeys::Gamepad_FaceButton_Left);
	C->MapKey(EagleAction, EKeys::V);                 C->MapKey(EagleAction, EKeys::Gamepad_FaceButton_Top);
}

void ACairoPlayerCharacter::SetupPlayerInputComponent(UInputComponent* PlayerInputComponent)
{
	Super::SetupPlayerInputComponent(PlayerInputComponent);
	BuildDefaultInput();
	if (APlayerController* PC = Cast<APlayerController>(GetController()))
	{
		if (UEnhancedInputLocalPlayerSubsystem* Sub = ULocalPlayer::GetSubsystem<UEnhancedInputLocalPlayerSubsystem>(PC->GetLocalPlayer()))
		{
			Sub->AddMappingContext(MappingContext, 0);
		}
	}
	UEnhancedInputComponent* EIC = Cast<UEnhancedInputComponent>(PlayerInputComponent);
	if (!EIC) { UE_LOG(LogCairo, Error, TEXT("Enhanced Input is not enabled")); return; }
	EIC->BindAction(MoveAction, ETriggerEvent::Triggered, this, &ACairoPlayerCharacter::Move);
	EIC->BindAction(MoveAction, ETriggerEvent::Completed, this, &ACairoPlayerCharacter::MoveStop);
	EIC->BindAction(LookAction, ETriggerEvent::Triggered, this, &ACairoPlayerCharacter::Look);
	EIC->BindAction(JumpAction, ETriggerEvent::Started, this, &ACairoPlayerCharacter::JumpPressed);
	EIC->BindAction(SprintAction, ETriggerEvent::Started, this, &ACairoPlayerCharacter::SprintStart);
	EIC->BindAction(SprintAction, ETriggerEvent::Completed, this, &ACairoPlayerCharacter::SprintStop);
	EIC->BindAction(AttackAction, ETriggerEvent::Started, this, &ACairoPlayerCharacter::AttackPressed);
	EIC->BindAction(HeavyAction, ETriggerEvent::Started, this, &ACairoPlayerCharacter::HeavyPressed);
	EIC->BindAction(ParryAction, ETriggerEvent::Started, this, &ACairoPlayerCharacter::ParryPressed);
	EIC->BindAction(DodgeAction, ETriggerEvent::Started, this, &ACairoPlayerCharacter::DodgePressed);
	EIC->BindAction(ContextAction, ETriggerEvent::Started, this, &ACairoPlayerCharacter::ContextPressed);
	EIC->BindAction(EagleAction, ETriggerEvent::Started, this, &ACairoPlayerCharacter::EaglePressed);
}

void ACairoPlayerCharacter::Move(const FInputActionValue& Value)
{
	MoveInput = Value.Get<FVector2D>();
	if (Stance != EPlayerStance::Normal || !Controller) return;
	const FRotator Yaw(0.f, Controller->GetControlRotation().Yaw, 0.f);
	AddMovementInput(FRotationMatrix(Yaw).GetUnitAxis(EAxis::X), MoveInput.Y);
	AddMovementInput(FRotationMatrix(Yaw).GetUnitAxis(EAxis::Y), MoveInput.X);
}

void ACairoPlayerCharacter::MoveStop(const FInputActionValue& Value) { MoveInput = FVector2D::ZeroVector; }

void ACairoPlayerCharacter::Look(const FInputActionValue& Value)
{
	const FVector2D V = Value.Get<FVector2D>();
	AddControllerYawInput(V.X);
	AddControllerPitchInput(V.Y);
}

void ACairoPlayerCharacter::JumpPressed()
{
	if (Stance == EPlayerStance::Climbing)
	{
		// نطة لورا من على الحيطة
		StopClimb(true);
		LaunchCharacter(WallNormal * 450.f + FVector(0, 0, 500.f), true, true);
		return;
	}
	if (Stance == EPlayerStance::AtViewPoint) { ContextPressed(); return; }
	if (Stance == EPlayerStance::Normal && !bCarrying) Jump();
}

// ---------------- Tick ----------------
void ACairoPlayerCharacter::Tick(float DeltaSeconds)
{
	Super::Tick(DeltaSeconds);
	if (bDead) return;
	const float Now = GetWorld()->GetTimeSeconds();
	if (!HUDWidget && HUDWidgetClass)
	{
		// الواجهة بتتعمل أول ما اللاعب يمسك الشخصية
		if (APlayerController* PC = Cast<APlayerController>(GetController()))
		{
			HUDWidget = CreateWidget<UCairoHUDWidget>(PC, HUDWidgetClass);
			if (HUDWidget) HUDWidget->AddToViewport();
		}
	}

	// الطاقة والصحة
	if (Stamina < MaxStamina && Now > StaminaRegenTime) { Stamina++; StaminaRegenTime = Now + 1.4f; }
	ACairoGameMode* GM = GetWorld()->GetAuthGameMode<ACairoGameMode>();
	const bool bCombat = GM && GM->AnyGuardAlerted();
	if (bCombat) HealthRegenDelay = Now + 4.f;
	else if (Now > HealthRegenDelay && Health < MaxHealth) Health = FMath::Min(MaxHealth, Health + 8.f * DeltaSeconds);

	if (bEagleVision && RealTime() > EagleEndTime) SetEagleVision(false);

	bSprinting = bSprintHeld && !bCarrying && MoveInput.SizeSquared() > 0.1f;
	GetCharacterMovement()->MaxWalkSpeed = bCarrying ? CarrySpeed : (bSprinting ? SprintSpeed : JogSpeed);
	if (GetCharacterMovement()->IsFalling()) FallStartZ = FMath::Max(FallStartZ, GetActorLocation().Z);

	switch (Stance)
	{
	case EPlayerStance::Normal:
		TryStartClimbOrMantle(DeltaSeconds);
		break;
	case EPlayerStance::Climbing:
		TickClimb(DeltaSeconds);
		break;
	case EPlayerStance::Mantling:
	{
		MantleAlpha += DeltaSeconds / MantleDuration;
		const float A = SmoothStep(MantleAlpha);
		FVector P = FMath::Lerp(MantleStart, MantleEnd, A);
		P.Z = FMath::Lerp(MantleStart.Z, MantleEnd.Z, SmoothStep(MantleAlpha * 1.6f));
		SetActorLocation(P);
		if (MantleAlpha >= 1.f)
		{
			Stance = EPlayerStance::Normal;
			GetCharacterMovement()->SetMovementMode(MOVE_Walking);
		}
		break;
	}
	case EPlayerStance::Cinematic:
		TickCinematic(DeltaSeconds);
		break;
	case EPlayerStance::Dodging:
		AddMovementInput(DodgeDir, 1.f);
		GetCharacterMovement()->MaxWalkSpeed = 900.f;
		if (Now > ActionEndTime) Stance = EPlayerStance::Normal;
		break;
	case EPlayerStance::Attacking:
	case EPlayerStance::Parrying:
	case EPlayerStance::HitReact:
		if (Now > ActionEndTime) Stance = EPlayerStance::Normal;
		break;
	case EPlayerStance::AtViewPoint:
		if (MoveInput.SizeSquared() > 0.1f && Now > ViewPointEnterTime + 0.8f) Stance = EPlayerStance::Normal; // أي حركة بتنزله من الوقفة
		break;
	default:
		break;
	}

	UpdateBlend();
	ComputeContext();
}

// ---------------- التسلق ----------------
bool ACairoPlayerCharacter::TraceWall(FHitResult& OutHit, float HeightOffset) const
{
	const FVector Fwd = GetActorForwardVector();
	const FVector Start = GetActorLocation() + FVector(0, 0, HeightOffset);
	FCollisionQueryParams Q(SCENE_QUERY_STAT(CairoWall), false, this);
	if (CarriedBody) Q.AddIgnoredActor(CarriedBody);
	return GetWorld()->SweepSingleByChannel(OutHit, Start, Start + Fwd * 75.f, FQuat::Identity, ECC_Visibility, FCollisionShape::MakeSphere(12.f), Q)
		&& FMath::Abs(OutHit.ImpactNormal.Z) < 0.3f;
}

bool ACairoPlayerCharacter::FindLedge(const FHitResult& WallHit, FVector& OutLedge) const
{
	const FVector Into = -WallHit.ImpactNormal;
	const FVector Top = WallHit.ImpactPoint + Into * 35.f + FVector(0, 0, 260.f);
	FHitResult Down;
	FCollisionQueryParams Q(SCENE_QUERY_STAT(CairoLedge), false, this);
	if (!GetWorld()->LineTraceSingleByChannel(Down, Top, Top - FVector(0, 0, 300.f), ECC_Visibility, Q)) return false;
	if (Down.ImpactNormal.Z < 0.7f || Down.bStartPenetrating) return false;
	OutLedge = Down.ImpactPoint;
	return true;
}

void ACairoPlayerCharacter::TryStartClimbOrMantle(float DeltaSeconds)
{
	if (bCarrying || MoveInput.Y < 0.5f) { WallPushTime = 0.f; return; }
	FHitResult Wall;
	if (!TraceWall(Wall, 0.f)) { WallPushTime = 0.f; return; }
	if (FVector::DotProduct(GetActorForwardVector(), -Wall.ImpactNormal) < 0.6f) { WallPushTime = 0.f; return; }
	WallPushTime += DeltaSeconds;
	WallNormal = Wall.ImpactNormal;

	const float FeetZ = GetActorLocation().Z - GetCapsuleComponent()->GetScaledCapsuleHalfHeight();
	FVector Ledge;
	if (FindLedge(Wall, Ledge) && Ledge.Z - FeetZ <= MaxMantleHeight && Ledge.Z - FeetZ > 45.f)
	{
		StartMantle(Ledge);
		return;
	}
	const float Needed = (bSprinting || GetCharacterMovement()->IsFalling()) ? 0.02f : 0.18f;
	if (WallPushTime >= Needed)
	{
		Stance = EPlayerStance::Climbing;
		GetCharacterMovement()->SetMovementMode(MOVE_Flying);
		GetCharacterMovement()->MaxFlySpeed = ClimbSpeed;
		GetCharacterMovement()->bOrientRotationToMovement = false;
		GetCharacterMovement()->StopMovementImmediately();
		SetActorRotation(FRotator(0.f, (-WallNormal).Rotation().Yaw, 0.f));
		WallPushTime = 0.f;
	}
}

void ACairoPlayerCharacter::TickClimb(float DeltaSeconds)
{
	FHitResult Chest;
	if (!TraceWall(Chest, 20.f)) { StopClimb(true); return; }
	WallNormal = Chest.ImpactNormal;
	SetActorRotation(FRotator(0.f, (-WallNormal).Rotation().Yaw, 0.f));

	// خلي يوسف لازق في الحيطة
	const float Gap = Chest.Distance - 30.f;
	if (FMath::Abs(Gap) > 2.f) AddActorWorldOffset(-WallNormal * Gap * FMath::Min(1.f, DeltaSeconds * 10.f), true);

	const FVector Right = FVector::CrossProduct(FVector::UpVector, -WallNormal).GetSafeNormal();
	AddMovementInput(FVector::UpVector, MoveInput.Y);
	AddMovementInput(Right, MoveInput.X * 0.6f);

	// وصلنا لفوق؟ الراس مش لاقية حيطة
	FHitResult Head;
	if (!TraceWall(Head, 95.f))
	{
		FVector Ledge;
		if (FindLedge(Chest, Ledge)) StartMantle(Ledge);
	}
}

void ACairoPlayerCharacter::StartMantle(const FVector& Ledge)
{
	Stance = EPlayerStance::Mantling;
	MantleAlpha = 0.f;
	MantleStart = GetActorLocation();
	MantleEnd = Ledge + FVector(0, 0, GetCapsuleComponent()->GetScaledCapsuleHalfHeight() + 2.f) - WallNormal * 20.f;
	GetCharacterMovement()->SetMovementMode(MOVE_Flying);
	GetCharacterMovement()->StopMovementImmediately();
	GetCharacterMovement()->bOrientRotationToMovement = true;
	PlayMontageSafe(MantleMontage);
	FallStartZ = MantleEnd.Z;
}

void ACairoPlayerCharacter::StopClimb(bool bFall)
{
	Stance = EPlayerStance::Normal;
	GetCharacterMovement()->bOrientRotationToMovement = true;
	GetCharacterMovement()->SetMovementMode(bFall ? MOVE_Falling : MOVE_Walking);
}

void ACairoPlayerCharacter::OnMovementModeChanged(EMovementMode PrevMovementMode, uint8 PreviousCustomMode)
{
	Super::OnMovementModeChanged(PrevMovementMode, PreviousCustomMode);
	if (GetCharacterMovement()->MovementMode == MOVE_Falling) FallStartZ = GetActorLocation().Z;
}

void ACairoPlayerCharacter::Landed(const FHitResult& Hit)
{
	Super::Landed(Hit);
	const float Fall = FallStartZ - GetActorLocation().Z;
	FallStartZ = GetActorLocation().Z;
	TArray<AActor*> Spots;
	GetOverlappingActors(Spots, AHidingSpot::StaticClass());
	if (Spots.Num() > 0 || Stance == EPlayerStance::Cinematic) return; // القش بيحمي من الوقعة
	if (Fall > DeadlyFallHeight) { Die(nullptr, false); return; }
	if (Fall > SafeFallHeight) ReceiveEnemyAttack(nullptr, (Fall - SafeFallHeight) / 100.f * 11.f, true);
}

bool ACairoPlayerCharacter::IsAirborneOrClimbing() const
{
	return GetCharacterMovement()->IsFalling() || Stance == EPlayerStance::Climbing || Stance == EPlayerStance::Mantling;
}

bool ACairoPlayerCharacter::IsOnRooftop() const
{
	FHitResult Hit;
	const FVector S = GetActorLocation();
	FCollisionQueryParams Q(SCENE_QUERY_STAT(CairoRoof), false, this);
	if (!GetWorld()->LineTraceSingleByChannel(Hit, S, S - FVector(0, 0, 400.f), ECC_Visibility, Q)) return false;
	return Hit.ImpactPoint.Z > 250.f; // الشارع على ارتفاع صفر في المرحلة
}

// ---------------- التخفي ----------------
bool ACairoPlayerCharacter::IsHiddenInSpot() const
{
	return CurrentHidingSpot != nullptr && !bCarrying && Stance == EPlayerStance::Normal && !GetCharacterMovement()->IsFalling();
}

void ACairoPlayerCharacter::UpdateBlend()
{
	bBlended = false;
	if (bSprinting || bCarrying || Stance != EPlayerStance::Normal || GetCharacterMovement()->IsFalling() || IsHiddenInSpot()) return;
	int32 Count = 0;
	for (TActorIterator<ACharacter> It(GetWorld()); It; ++It)
	{
		if (It->ActorHasTag(TEXT("Civilian")) && FVector::DistSquared(It->GetActorLocation(), GetActorLocation()) < 200.f * 200.f) Count++;
	}
	bBlended = Count >= 2;
}

EVisibilityStatus ACairoPlayerCharacter::GetVisibilityStatus() const
{
	const ACairoGameMode* GM = GetWorld()->GetAuthGameMode<ACairoGameMode>();
	if (GM && GM->AnyGuardAlerted()) return EVisibilityStatus::Exposed;
	if (IsHiddenInSpot()) return EVisibilityStatus::Hidden;
	if (bBlended) return EVisibilityStatus::Blended;
	if (GM && GM->AnyGuardSuspicious()) return EVisibilityStatus::Suspicious;
	return EVisibilityStatus::Anonymous;
}

// ---------------- القتال ----------------
TArray<ACairoCharacterBase*> ACairoPlayerCharacter::GetEnemies() const
{
	TArray<ACairoCharacterBase*> Out;
	for (TActorIterator<AGuardCharacter> It(GetWorld()); It; ++It) if (!It->IsDead()) Out.Add(*It);
	return Out;
}

AGuardCharacter* ACairoPlayerCharacter::FindLockTarget(float Range) const
{
	AGuardCharacter* Best = nullptr;
	float BestScore = TNumericLimits<float>::Max();
	const FVector CamFwd = Controller ? FRotator(0, Controller->GetControlRotation().Yaw, 0).Vector() : GetActorForwardVector();
	for (TActorIterator<AGuardCharacter> It(GetWorld()); It; ++It)
	{
		if (It->IsDead()) continue;
		FVector D = It->GetActorLocation() - GetActorLocation();
		if (FMath::Abs(D.Z) > 120.f) continue;
		D.Z = 0.f;
		const float Dist = D.Size();
		if (Dist > Range) continue;
		const float Dot = FVector::DotProduct(D / FMath::Max(Dist, 1.f), CamFwd);
		if (Dot < -0.3f) continue;
		const float Score = Dist - Dot * 200.f;
		if (Score < BestScore) { BestScore = Score; Best = *It; }
	}
	return Best;
}

void ACairoPlayerCharacter::StartAttack(bool bHeavy)
{
	const float Now = GetWorld()->GetTimeSeconds();
	if (AGuardCharacter* T = FindLockTarget(450.f))
	{
		FVector D = T->GetActorLocation() - GetActorLocation(); D.Z = 0.f;
		SetActorRotation(D.Rotation());
		if (D.Size() > 170.f) LaunchCharacter(D.GetSafeNormal() * 600.f, true, false); // اندفاع للهدف
	}
	Stance = EPlayerStance::Attacking;
	float Len = 0.f;
	if (bHeavy)
	{
		Stamina--; StaminaRegenTime = Now + 1.4f;
		Len = PlayMontageSafe(HeavyAttackMontage);
		if (Len <= 0.f) Len = 0.85f;
	}
	else
	{
		if (Now > ComboResetTime) ComboIndex = 0;
		UAnimMontage* M = LightAttackMontages.Num() ? LightAttackMontages[ComboIndex % LightAttackMontages.Num()].Get() : nullptr;
		Len = PlayMontageSafe(M);
		if (Len <= 0.f) Len = 0.48f;
		ComboIndex++;
		ComboResetTime = Now + Len + 0.5f;
	}
	ActionEndTime = Now + Len * 0.8f;
	GetWorldTimerManager().SetTimer(HitTimer, FTimerDelegate::CreateWeakLambda(this, [this, bHeavy]() { DoMeleeHit(bHeavy); }), Len * (bHeavy ? 0.55f : 0.42f), false);
}

void ACairoPlayerCharacter::DoMeleeHit(bool bHeavy)
{
	if (bDead) return;
	const FVector Fwd = GetActorForwardVector();
	for (ACairoCharacterBase* E : GetEnemies())
	{
		FVector D = E->GetActorLocation() - GetActorLocation();
		if (FMath::Abs(D.Z) > 110.f) continue;
		D.Z = 0.f;
		if (D.Size() > AttackRange * (bHeavy ? 1.15f : 1.f)) continue;
		if (FVector::DotProduct(D.GetSafeNormal(), Fwd) < 0.45f) continue;
		const bool bThird = !bHeavy && (ComboIndex % 3 == 0);
		E->ApplyHit(this, bHeavy ? HeavyDamage : (bThird ? LightDamage * 1.5f : LightDamage), bHeavy ? HeavyStun : LightStun, bHeavy);
	}
}

void ACairoPlayerCharacter::AttackPressed()
{
	if (Stance == EPlayerStance::Attacking && GetWorld()->GetTimeSeconds() > ActionEndTime - 0.15f) { StartAttack(false); return; }
	if (Stance != EPlayerStance::Normal || bCarrying || GetCharacterMovement()->IsFalling()) return;
	StartAttack(false);
}

void ACairoPlayerCharacter::HeavyPressed()
{
	if (Stance != EPlayerStance::Normal || bCarrying || Stamina <= 0 || GetCharacterMovement()->IsFalling()) return;
	StartAttack(true);
}

void ACairoPlayerCharacter::ParryPressed()
{
	if (Stance != EPlayerStance::Normal || bCarrying) return;
	const float Now = GetWorld()->GetTimeSeconds();
	Stance = EPlayerStance::Parrying;
	ParryEndTime = Now + ParryWindow;
	ActionEndTime = Now + 0.42f;
	if (AGuardCharacter* T = FindLockTarget(500.f)) { FVector D = T->GetActorLocation() - GetActorLocation(); D.Z = 0; SetActorRotation(D.Rotation()); }
	PlayMontageSafe(ParryMontage);
}

void ACairoPlayerCharacter::DodgePressed()
{
	if (Stance == EPlayerStance::Climbing) { StopClimb(true); return; }
	if (Stance != EPlayerStance::Normal || bCarrying || Stamina <= 0 || GetCharacterMovement()->IsFalling()) return;
	const float Now = GetWorld()->GetTimeSeconds();
	Stamina--; StaminaRegenTime = Now + 1.4f;
	Stance = EPlayerStance::Dodging;
	ActionEndTime = Now + 0.5f;
	IFramesEndTime = Now + 0.42f;
	const FRotator Yaw(0, Controller ? Controller->GetControlRotation().Yaw : GetActorRotation().Yaw, 0);
	DodgeDir = MoveInput.SizeSquared() > 0.05f
		? (FRotationMatrix(Yaw).GetUnitAxis(EAxis::X) * MoveInput.Y + FRotationMatrix(Yaw).GetUnitAxis(EAxis::Y) * MoveInput.X).GetSafeNormal()
		: -GetActorForwardVector();
	SetActorRotation(DodgeDir.Rotation());
	PlayMontageSafe(DodgeMontage);
}

void ACairoPlayerCharacter::ReceiveEnemyAttack(ACairoCharacterBase* Attacker, float Damage, bool bHeavy)
{
	if (bDead || Stance == EPlayerStance::Cinematic) return;
	const float Now = GetWorld()->GetTimeSeconds();
	if (Now < IFramesEndTime) return;
	if (Attacker && !bHeavy && Now < ParryEndTime)
	{
		// صد ناجح: الحارس بيتهز وتوازنه بيقع
		SlowMotion(0.3f, 0.35f);
		if (AGuardCharacter* G = Cast<AGuardCharacter>(Attacker)) G->OnParried();
		Stance = EPlayerStance::Normal;
		ParryEndTime = 0.f;
		return;
	}
	Health -= Damage;
	HealthRegenDelay = Now + 4.f;
	OnHitTaken(Damage, bHeavy);
	if (Health <= 0.f) { Die(Attacker, false); return; }
	if (Stance != EPlayerStance::Climbing)
	{
		Stance = EPlayerStance::HitReact;
		ActionEndTime = Now + 0.32f;
		PlayMontageSafe(HitReactMontage);
	}
}

// ---------------- الاغتيال والأفعال ----------------
void ACairoPlayerCharacter::ComputeContext()
{
	CurrentContext = FContextOption();
	if (bDead) return;
	if (bCarrying) { CurrentContext.Action = EContextAction::DropBody; return; }
	if (Stance == EPlayerStance::AtViewPoint) { if (CurrentViewPoint && CurrentViewPoint->LeapTarget) CurrentContext.Action = EContextAction::LeapOfFaith; return; }
	if (Stance != EPlayerStance::Normal && Stance != EPlayerStance::Climbing) return;

	const FVector Me = GetActorLocation();
	const bool bAir = GetCharacterMovement()->IsFalling();
	float Best = TNumericLimits<float>::Max();
	for (ACairoCharacterBase* E : GetEnemies())
	{
		AGuardCharacter* G = Cast<AGuardCharacter>(E);
		const FVector D = E->GetActorLocation() - Me;
		const float Horiz = FVector(D.X, D.Y, 0.f).Size();
		const float Below = -D.Z;
		EContextAction A = EContextAction::None;
		if (G && G->IsStunned() && Horiz < 260.f && FMath::Abs(D.Z) < 100.f) A = EContextAction::Finisher;
		else if (Below > 140.f && Below < 1400.f && Horiz < (bAir ? 350.f : 450.f) && (bAir || !G || !G->IsAlerted())) A = EContextAction::AirAssassinate;
		else if (FMath::Abs(D.Z) < 80.f && Horiz < (IsHiddenInSpot() ? 240.f : 190.f) && Stance == EPlayerStance::Normal)
		{
			const bool bFacingMe = G && FVector::DotProduct(G->GetActorForwardVector(), (-D).GetSafeNormal2D()) > 0.35f;
			if (!G || G->bIsTarget || !G->IsAlerted() || !bFacingMe) A = EContextAction::Assassinate;
		}
		if (A == EContextAction::None) continue;
		float Score = Horiz;
		if (G && G->bIsTarget) Score -= 5000.f;
		if (A == EContextAction::Finisher) Score -= 2000.f;
		if (Score < Best) { Best = Score; CurrentContext.Action = A; CurrentContext.Victim = E; }
	}
	if (CurrentContext.Action != EContextAction::None || bAir) return;
	for (TActorIterator<AGuardCharacter> It(GetWorld()); It; ++It)
	{
		if (It->IsDead() && !It->bBodyHidden && !It->bBodyCarried && FVector::Dist(It->GetBodyLocation(), Me) < 170.f)
		{
			CurrentContext.Action = EContextAction::CarryBody; CurrentContext.Victim = *It; return;
		}
	}
}

FText ACairoPlayerCharacter::GetContextLabel() const
{
	switch (CurrentContext.Action)
	{
	case EContextAction::Assassinate:    return LOCTEXT("Assassinate", "اغتيال");
	case EContextAction::AirAssassinate: return LOCTEXT("AirAssassinate", "اغتيال جوي");
	case EContextAction::Finisher:       return LOCTEXT("Finisher", "إعدام");
	case EContextAction::LeapOfFaith:    return LOCTEXT("Leap", "قفزة الإيمان");
	case EContextAction::CarryBody:      return LOCTEXT("Carry", "شيل الجثة");
	case EContextAction::DropBody:       return LOCTEXT("Drop", "ارمي الجثة");
	default:                             return FText::GetEmpty();
	}
}

void ACairoPlayerCharacter::ContextPressed()
{
	const FContextOption C = CurrentContext;
	switch (C.Action)
	{
	case EContextAction::Assassinate:
	case EContextAction::AirAssassinate:
	case EContextAction::Finisher:
		ExecuteKill(C.Victim, C.Action);
		break;
	case EContextAction::LeapOfFaith:
	{
		AActor* Hay = CurrentViewPoint->LeapTarget;
		CurrentViewPoint = nullptr;
		PlayMontageSafe(LeapOfFaithMontage);
		StartCinematic(Hay->GetActorLocation() + FVector(0, 0, 90.f), 1.4f, 250.f, [this]() { FallStartZ = GetActorLocation().Z; });
		break;
	}
	case EContextAction::CarryBody:
		CarriedBody = C.Victim;
		CarriedBody->PrepareForCarry(GetMesh(), CarrySocket);
		bCarrying = true;
		break;
	case EContextAction::DropBody:
		if (CarriedBody)
		{
			const bool bHide = CurrentHidingSpot != nullptr;
			const FVector At = bHide ? CurrentHidingSpot->GetActorLocation() : GetActorLocation() + GetActorForwardVector() * 80.f;
			CarriedBody->DropBody(At, bHide);
			CarriedBody = nullptr;
		}
		bCarrying = false;
		break;
	default:
		break;
	}
}

void ACairoPlayerCharacter::ExecuteKill(ACairoCharacterBase* Victim, EContextAction Kind)
{
	if (!Victim) return;
	AGuardCharacter* G = Cast<AGuardCharacter>(Victim);
	if (G) G->LockForCinematic(this);
	FVector Dir = Victim->GetActorLocation() - GetActorLocation(); Dir.Z = 0.f; Dir.Normalize();
	const FVector Behind = Victim->GetActorLocation() - Dir * (Kind == EContextAction::Finisher ? 110.f : 80.f);

	UAnimMontage* M = Kind == EContextAction::AirAssassinate ? AirAssassinateMontage.Get() : Kind == EContextAction::Finisher ? FinisherMontage.Get() : AssassinateMontage.Get();
	const float Dur = Kind == EContextAction::AirAssassinate ? 0.5f : 0.25f;
	const float Arc = Kind == EContextAction::AirAssassinate ? 60.f : 0.f;
	SlowMotion(Kind == EContextAction::Finisher ? 0.35f : 0.45f, Kind == EContextAction::Finisher ? 0.9f : 0.6f);
	if (Kind == EContextAction::Finisher) MonochromeFlash(0.55f);

	StartCinematic(FVector(Behind.X, Behind.Y, Kind == EContextAction::AirAssassinate ? Victim->GetActorLocation().Z : GetActorLocation().Z), Dur, Arc,
		[this, Victim, M]()
		{
			FVector D = Victim->GetActorLocation() - GetActorLocation(); D.Z = 0.f;
			SetActorRotation(D.Rotation());
			const float Len = PlayMontageSafe(M);
			Victim->PlayMontageSafe(Victim->AssassinatedMontage);
			FTimerHandle H;
			GetWorldTimerManager().SetTimer(H, FTimerDelegate::CreateWeakLambda(this, [this, Victim]()
			{
				Victim->Die(this, true);
				Stance = EPlayerStance::Normal;
				GetCharacterMovement()->SetMovementMode(MOVE_Walking);
			}), FMath::Max(0.35f, Len * 0.55f), false);
			Stance = EPlayerStance::Cinematic;
			CineDuration = 0.f;
		});
}

void ACairoPlayerCharacter::StartCinematic(const FVector& To, float Duration, float Arc, TFunction<void()> OnDone)
{
	Stance = EPlayerStance::Cinematic;
	CineStart = GetActorLocation();
	CineEnd = To;
	CineTime = 0.f;
	CineDuration = Duration;
	CineArc = Arc;
	CineDone = MoveTemp(OnDone);
	GetCharacterMovement()->SetMovementMode(MOVE_Flying);
	GetCharacterMovement()->StopMovementImmediately();
}

void ACairoPlayerCharacter::TickCinematic(float DeltaSeconds)
{
	if (CineDuration <= 0.f) return; // في انتظار المونتاج
	CineTime += DeltaSeconds;
	const float K = FMath::Clamp(CineTime / CineDuration, 0.f, 1.f);
	FVector P = FMath::Lerp(CineStart, CineEnd, SmoothStep(K));
	P.Z = FMath::Lerp(CineStart.Z, CineEnd.Z, K * K) + FMath::Sin(PI * K) * CineArc;
	SetActorLocation(P);
	if (K >= 1.f)
	{
		CineDuration = 0.f;
		Stance = EPlayerStance::Normal;
		GetCharacterMovement()->SetMovementMode(MOVE_Walking);
		if (CineDone) { TFunction<void()> Done = MoveTemp(CineDone); CineDone = nullptr; Done(); }
	}
}

void ACairoPlayerCharacter::SlowMotion(float Dilation, float RealSeconds)
{
	UGameplayStatics::SetGlobalTimeDilation(this, Dilation);
	// المؤقت بيتأثر بالتبطيء، فبنضرب في المعامل عشان يخلص بعد وقت حقيقي
	GetWorldTimerManager().SetTimer(SlowTimer, FTimerDelegate::CreateWeakLambda(this, [this]() { UGameplayStatics::SetGlobalTimeDilation(this, 1.f); }), RealSeconds * Dilation, false);
}

void ACairoPlayerCharacter::MonochromeFlash(float RealSeconds)
{
	FPostProcessSettings& PP = FollowCamera->PostProcessSettings;
	PP.bOverride_ColorSaturation = true;
	PP.ColorSaturation = FVector4(0.f, 0.f, 0.f, 1.f);
	PP.bOverride_ColorContrast = true;
	PP.ColorContrast = FVector4(1.4f, 1.4f, 1.4f, 1.f);
	const float Dil = UGameplayStatics::GetGlobalTimeDilation(this);
	GetWorldTimerManager().SetTimer(MonoTimer, FTimerDelegate::CreateWeakLambda(this, [this]()
	{
		FPostProcessSettings& P = FollowCamera->PostProcessSettings;
		P.bOverride_ColorContrast = false;
		P.bOverride_ColorSaturation = bEagleVision;
		P.ColorSaturation = FVector4(0.3f, 0.3f, 0.3f, 1.f);
	}), RealSeconds * Dil, false);
}

void ACairoPlayerCharacter::EaglePressed() { SetEagleVision(!bEagleVision); }

void ACairoPlayerCharacter::SetEagleVision(bool bOn)
{
	bEagleVision = bOn;
	EagleEndTime = RealTime() + EagleDuration;
	FPostProcessSettings& PP = FollowCamera->PostProcessSettings;
	PP.bOverride_ColorSaturation = bOn;
	PP.ColorSaturation = FVector4(0.3f, 0.3f, 0.3f, 1.f);
	PP.bOverride_ColorGain = bOn;
	PP.ColorGain = FVector4(0.8f, 0.9f, 1.15f, 1.f);
	for (FWeightedBlendable& B : PP.WeightedBlendables.Array) B.Weight = bOn ? 1.f : 0.f;
	for (TActorIterator<AGuardCharacter> It(GetWorld()); It; ++It)
	{
		It->GetMesh()->SetRenderCustomDepth(bOn && !It->IsDead());
		It->GetMesh()->SetCustomDepthStencilValue(It->bIsTarget ? 2 : 1);
		if (bOn && It->bIsTarget)
		{
			if (ACairoGameMode* GM = GetWorld()->GetAuthGameMode<ACairoGameMode>()) GM->RevealTarget();
		}
	}
}

void ACairoPlayerCharacter::EnterViewPoint(AViewPoint* VP)
{
	if (Stance == EPlayerStance::Cinematic) return;
	CurrentViewPoint = VP;
	if (Stance == EPlayerStance::Climbing || Stance == EPlayerStance::Mantling) { GetCharacterMovement()->SetMovementMode(MOVE_Walking); }
	Stance = EPlayerStance::AtViewPoint;
	ViewPointEnterTime = GetWorld()->GetTimeSeconds();
	GetCharacterMovement()->StopMovementImmediately();
	if (ACairoGameMode* GM = GetWorld()->GetAuthGameMode<ACairoGameMode>()) GM->Synchronize();
}

#undef LOCTEXT_NAMESPACE
