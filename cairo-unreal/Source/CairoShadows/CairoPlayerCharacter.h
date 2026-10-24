#pragma once

#include "CoreMinimal.h"
#include "CairoCharacterBase.h"
#include "CairoTypes.h"
#include "InputActionValue.h"
#include "CairoPlayerCharacter.generated.h"

class USpringArmComponent;
class UCameraComponent;
class UInputMappingContext;
class UInputAction;
class AHidingSpot;
class AViewPoint;
class AGuardCharacter;
class UCairoHUDWidget;
class UMaterialInterface;

USTRUCT(BlueprintType)
struct FContextOption
{
	GENERATED_BODY()

	UPROPERTY(BlueprintReadOnly)
	EContextAction Action = EContextAction::None;

	UPROPERTY(BlueprintReadOnly)
	TObjectPtr<ACairoCharacterBase> Victim = nullptr;
};

// يوسف: تسلق، تسلل، اغتيال، قتال بالسيف
UCLASS()
class CAIROSHADOWS_API ACairoPlayerCharacter : public ACairoCharacterBase
{
	GENERATED_BODY()

public:
	ACairoPlayerCharacter();

	virtual void Tick(float DeltaSeconds) override;
	virtual void SetupPlayerInputComponent(UInputComponent* PlayerInputComponent) override;
	virtual void Landed(const FHitResult& Hit) override;
	virtual void OnMovementModeChanged(EMovementMode PrevMovementMode, uint8 PreviousCustomMode = 0) override;

	// ----- الكاميرا -----
	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Cairo|Camera")
	TObjectPtr<USpringArmComponent> CameraBoom;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Cairo|Camera")
	TObjectPtr<UCameraComponent> FollowCamera;

	// ----- الإدخال (لو سبتها فاضية بتتعمل تلقائي من الكود) -----
	UPROPERTY(EditAnywhere, Category = "Cairo|Input") TObjectPtr<UInputMappingContext> MappingContext;
	UPROPERTY(EditAnywhere, Category = "Cairo|Input") TObjectPtr<UInputAction> MoveAction;
	UPROPERTY(EditAnywhere, Category = "Cairo|Input") TObjectPtr<UInputAction> LookAction;
	UPROPERTY(EditAnywhere, Category = "Cairo|Input") TObjectPtr<UInputAction> JumpAction;
	UPROPERTY(EditAnywhere, Category = "Cairo|Input") TObjectPtr<UInputAction> SprintAction;
	UPROPERTY(EditAnywhere, Category = "Cairo|Input") TObjectPtr<UInputAction> AttackAction;
	UPROPERTY(EditAnywhere, Category = "Cairo|Input") TObjectPtr<UInputAction> HeavyAction;
	UPROPERTY(EditAnywhere, Category = "Cairo|Input") TObjectPtr<UInputAction> ParryAction;
	UPROPERTY(EditAnywhere, Category = "Cairo|Input") TObjectPtr<UInputAction> DodgeAction;
	UPROPERTY(EditAnywhere, Category = "Cairo|Input") TObjectPtr<UInputAction> ContextAction;
	UPROPERTY(EditAnywhere, Category = "Cairo|Input") TObjectPtr<UInputAction> EagleAction;

	// ----- الحركة -----
	UPROPERTY(EditAnywhere, Category = "Cairo|Movement") float JogSpeed = 420.f;
	UPROPERTY(EditAnywhere, Category = "Cairo|Movement") float SprintSpeed = 700.f;
	UPROPERTY(EditAnywhere, Category = "Cairo|Movement") float CarrySpeed = 170.f;
	UPROPERTY(EditAnywhere, Category = "Cairo|Movement") float ClimbSpeed = 180.f;
	UPROPERTY(EditAnywhere, Category = "Cairo|Movement") float MaxMantleHeight = 200.f;
	UPROPERTY(EditAnywhere, Category = "Cairo|Movement") float MantleDuration = 0.45f;
	UPROPERTY(EditAnywhere, Category = "Cairo|Movement") float SafeFallHeight = 800.f;
	UPROPERTY(EditAnywhere, Category = "Cairo|Movement") float DeadlyFallHeight = 1700.f;

	// ----- القتال -----
	UPROPERTY(EditAnywhere, Category = "Cairo|Combat") float LightDamage = 18.f;
	UPROPERTY(EditAnywhere, Category = "Cairo|Combat") float HeavyDamage = 34.f;
	UPROPERTY(EditAnywhere, Category = "Cairo|Combat") float LightStun = 16.f;
	UPROPERTY(EditAnywhere, Category = "Cairo|Combat") float HeavyStun = 38.f;
	UPROPERTY(EditAnywhere, Category = "Cairo|Combat") float AttackRange = 230.f;
	UPROPERTY(EditAnywhere, Category = "Cairo|Combat") float ParryWindow = 0.32f;
	UPROPERTY(EditAnywhere, Category = "Cairo|Combat") int32 MaxStamina = 4;

	// ----- الأنيميشن (مونتاجات بتتحط من المحرر) -----
	UPROPERTY(EditAnywhere, Category = "Cairo|Anim") TArray<TObjectPtr<UAnimMontage>> LightAttackMontages;
	UPROPERTY(EditAnywhere, Category = "Cairo|Anim") TObjectPtr<UAnimMontage> HeavyAttackMontage;
	UPROPERTY(EditAnywhere, Category = "Cairo|Anim") TObjectPtr<UAnimMontage> ParryMontage;
	UPROPERTY(EditAnywhere, Category = "Cairo|Anim") TObjectPtr<UAnimMontage> DodgeMontage;
	UPROPERTY(EditAnywhere, Category = "Cairo|Anim") TObjectPtr<UAnimMontage> MantleMontage;
	UPROPERTY(EditAnywhere, Category = "Cairo|Anim") TObjectPtr<UAnimMontage> AssassinateMontage;
	UPROPERTY(EditAnywhere, Category = "Cairo|Anim") TObjectPtr<UAnimMontage> AirAssassinateMontage;
	UPROPERTY(EditAnywhere, Category = "Cairo|Anim") TObjectPtr<UAnimMontage> FinisherMontage;
	UPROPERTY(EditAnywhere, Category = "Cairo|Anim") TObjectPtr<UAnimMontage> LeapOfFaithMontage;
	UPROPERTY(EditAnywhere, Category = "Cairo|Anim") FName CarrySocket = TEXT("spine_05");

	// ----- الواجهة وعين الصقر -----
	UPROPERTY(EditAnywhere, Category = "Cairo|UI") TSubclassOf<UCairoHUDWidget> HUDWidgetClass;
	UPROPERTY(EditAnywhere, Category = "Cairo|UI") TObjectPtr<UMaterialInterface> EagleOutlineMaterial;
	UPROPERTY(EditAnywhere, Category = "Cairo|UI") float EagleDuration = 7.f;

	// ----- حالة اللاعب (للأنيميشن بلوبرينت والواجهة) -----
	UPROPERTY(BlueprintReadOnly, Category = "Cairo|State") EPlayerStance Stance = EPlayerStance::Normal;
	UPROPERTY(BlueprintReadOnly, Category = "Cairo|State") int32 Stamina = 4;
	UPROPERTY(BlueprintReadOnly, Category = "Cairo|State") bool bSprinting = false;
	UPROPERTY(BlueprintReadOnly, Category = "Cairo|State") bool bCarrying = false;
	UPROPERTY(BlueprintReadOnly, Category = "Cairo|State") bool bEagleVision = false;
	UPROPERTY(BlueprintReadOnly, Category = "Cairo|State") FContextOption CurrentContext;

	UFUNCTION(BlueprintPure, Category = "Cairo") bool IsClimbing() const { return Stance == EPlayerStance::Climbing; }
	UFUNCTION(BlueprintPure, Category = "Cairo") bool IsHiddenInSpot() const;
	UFUNCTION(BlueprintPure, Category = "Cairo") bool IsBlendedInCrowd() const { return bBlended; }
	UFUNCTION(BlueprintPure, Category = "Cairo") EVisibilityStatus GetVisibilityStatus() const;
	UFUNCTION(BlueprintPure, Category = "Cairo") FText GetContextLabel() const;
	bool IsAirborneOrClimbing() const;
	bool IsOnRooftop() const;

	// الحراس بيضربوا يوسف من هنا (فيها الصد والتفادي)
	void ReceiveEnemyAttack(ACairoCharacterBase* Attacker, float Damage, bool bHeavy);

	// مناطق في المرحلة
	void SetHidingSpot(AHidingSpot* Spot) { CurrentHidingSpot = Spot; }
	void ClearHidingSpot(AHidingSpot* Spot) { if (CurrentHidingSpot == Spot) CurrentHidingSpot = nullptr; }
	void EnterViewPoint(AViewPoint* VP);

protected:
	virtual void BeginPlay() override;

	void BuildDefaultInput();
	void Move(const FInputActionValue& Value);
	void MoveStop(const FInputActionValue& Value);
	void Look(const FInputActionValue& Value);
	void JumpPressed();
	void SprintStart() { bSprintHeld = true; }
	void SprintStop() { bSprintHeld = false; }
	void AttackPressed();
	void HeavyPressed();
	void ParryPressed();
	void DodgePressed();
	void ContextPressed();
	void EaglePressed();

	// تسلق
	bool TraceWall(FHitResult& OutHit, float HeightOffset) const;
	bool FindLedge(const FHitResult& WallHit, FVector& OutLedge) const;
	void TryStartClimbOrMantle(float DeltaSeconds);
	void TickClimb(float DeltaSeconds);
	void StartMantle(const FVector& Ledge);
	void StopClimb(bool bFall);

	// قتال
	void StartAttack(bool bHeavy);
	void DoMeleeHit(bool bHeavy);
	AGuardCharacter* FindLockTarget(float Range) const;
	TArray<ACairoCharacterBase*> GetEnemies() const;

	// اغتيال ولقطات
	void ComputeContext();
	void StartCinematic(const FVector& To, float Duration, float Arc, TFunction<void()> OnDone);
	void TickCinematic(float DeltaSeconds);
	void SlowMotion(float Dilation, float RealSeconds);
	void MonochromeFlash(float RealSeconds);
	void ExecuteKill(ACairoCharacterBase* Victim, EContextAction Kind);

	void UpdateBlend();
	void SetEagleVision(bool bOn);

private:
	FVector2D MoveInput = FVector2D::ZeroVector;
	bool bSprintHeld = false;
	bool bBlended = false;
	float WallPushTime = 0.f;
	FVector WallNormal = FVector::ZeroVector;

	FVector MantleStart, MantleEnd;
	float MantleAlpha = 0.f;

	FVector CineStart, CineEnd;
	float CineTime = 0.f, CineDuration = 0.f, CineArc = 0.f;
	TFunction<void()> CineDone;

	int32 ComboIndex = 0;
	float ComboResetTime = 0.f;
	float ActionEndTime = 0.f;
	float ParryEndTime = 0.f;
	float IFramesEndTime = 0.f;
	float StaminaRegenTime = 0.f;
	float HealthRegenDelay = 0.f;
	float EagleEndTime = 0.f;
	float FallStartZ = 0.f;
	float ViewPointEnterTime = 0.f;
	FVector DodgeDir = FVector::ZeroVector;

	UPROPERTY() TObjectPtr<AHidingSpot> CurrentHidingSpot;
	UPROPERTY() TObjectPtr<AViewPoint> CurrentViewPoint;
	UPROPERTY() TObjectPtr<ACairoCharacterBase> CarriedBody;
	UPROPERTY() TObjectPtr<UCairoHUDWidget> HUDWidget;

	FTimerHandle HitTimer, SlowTimer, MonoTimer;
	float RealTime() const;
};
