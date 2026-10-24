#pragma once

#include "CoreMinimal.h"
#include "CairoCharacterBase.h"
#include "CairoTypes.h"
#include "GuardCharacter.generated.h"

class AArrowProjectile;
class UWidgetComponent;

// حارس إنكشاري / رامي / الهدف (حسن آغا)
UCLASS()
class CAIROSHADOWS_API AGuardCharacter : public ACairoCharacterBase
{
	GENERATED_BODY()

public:
	AGuardCharacter();

	// ----- الدور في المرحلة -----
	UPROPERTY(EditInstanceOnly, BlueprintReadOnly, Category = "Cairo|Role", meta = (ToolTip = "نقط الدورية (حط Target Points في المرحلة)"))
	TArray<TObjectPtr<AActor>> PatrolPoints;

	UPROPERTY(EditInstanceOnly, Category = "Cairo|Role") float PatrolWaitTime = 1.8f;
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Cairo|Role") bool bIsArcher = false;
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Cairo|Role") bool bIsTarget = false;
	UPROPERTY(EditInstanceOnly, BlueprintReadOnly, Category = "Cairo|Role", meta = (ToolTip = "حارس الهدف: بيمشي وراه"))
	TObjectPtr<AGuardCharacter> EscortOf;

	// ----- النظر -----
	UPROPERTY(EditAnywhere, Category = "Cairo|Sight") float SightRange = 1800.f;
	UPROPERTY(EditAnywhere, Category = "Cairo|Sight") float SightRangeUpward = 1200.f;
	UPROPERTY(EditAnywhere, Category = "Cairo|Sight") float FieldOfView = 110.f;
	UPROPERTY(EditAnywhere, Category = "Cairo|Sight") float DetectionSpeed = 0.85f;

	// ----- القتال -----
	UPROPERTY(EditAnywhere, Category = "Cairo|Combat") float AttackRange = 270.f;
	UPROPERTY(EditAnywhere, Category = "Cairo|Combat") float LightDamage = 13.f;
	UPROPERTY(EditAnywhere, Category = "Cairo|Combat") float HeavyDamage = 26.f;
	UPROPERTY(EditAnywhere, Category = "Cairo|Combat") float WindupTime = 0.65f;
	UPROPERTY(EditAnywhere, Category = "Cairo|Combat") float HeavyWindupTime = 1.0f;
	UPROPERTY(EditAnywhere, Category = "Cairo|Combat") float HeavyChance = 0.22f;
	UPROPERTY(EditAnywhere, Category = "Cairo|Combat") float BlockChance = 0.35f;
	UPROPERTY(EditAnywhere, Category = "Cairo|Combat") float StunnedDuration = 3.5f;
	UPROPERTY(EditAnywhere, Category = "Cairo|Combat") TSubclassOf<AArrowProjectile> ArrowClass;
	UPROPERTY(EditAnywhere, Category = "Cairo|Combat") float ShootInterval = 2.4f;

	UPROPERTY(EditAnywhere, Category = "Cairo|Anim") TObjectPtr<UAnimMontage> WindupMontage;
	UPROPERTY(EditAnywhere, Category = "Cairo|Anim") TObjectPtr<UAnimMontage> AttackMontage;
	UPROPERTY(EditAnywhere, Category = "Cairo|Anim") TObjectPtr<UAnimMontage> HeavyAttackMontage;
	UPROPERTY(EditAnywhere, Category = "Cairo|Anim") TObjectPtr<UAnimMontage> BlockMontage;
	UPROPERTY(EditAnywhere, Category = "Cairo|Anim") TObjectPtr<UAnimMontage> StunnedMontage;
	UPROPERTY(EditAnywhere, Category = "Cairo|Anim") TObjectPtr<UAnimMontage> ShootMontage;

	// علامة الاكتشاف فوق الراس (بتتصمم في بلوبرينت ويدجت)
	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Cairo|UI") TObjectPtr<UWidgetComponent> StatusWidget;

	// ----- حالة (للأنيميشن والويدجت) -----
	UPROPERTY(BlueprintReadOnly, Category = "Cairo|State") EGuardState State = EGuardState::Patrol;
	UPROPERTY(BlueprintReadOnly, Category = "Cairo|State") float Detection = 0.f;
	UPROPERTY(BlueprintReadOnly, Category = "Cairo|State") bool bWindingUp = false;
	UPROPERTY(BlueprintReadOnly, Category = "Cairo|State") bool bHeavyWindup = false;

	UFUNCTION(BlueprintPure, Category = "Cairo") bool IsAlerted() const { return State == EGuardState::Alert; }
	UFUNCTION(BlueprintPure, Category = "Cairo") bool IsStunned() const { return State == EGuardState::Stunned; }
	UFUNCTION(BlueprintImplementableEvent, Category = "Cairo") void OnBark(const FText& Line);

	virtual void ApplyHit(ACairoCharacterBase* Attacker, float Damage, float StunAmount, bool bHeavy) override;
	virtual void Die(ACairoCharacterBase* Killer, bool bSilent) override;

	void Bark(const FText& Line) { OnBark(Line); }
	void OnParried();
	void LockForCinematic(AActor* Killer);
	bool IsCinematicLocked() const { return bCinematicLock; }
	void BeginAttack();
	void FireArrow(AActor* Target);
	void EnterStun();

	float StunEndTime = 0.f;
	float NextAttackTime = 0.f;
	int32 HitStreak = 0;

protected:
	virtual void BeginPlay() override;
	virtual void Tick(float DeltaSeconds) override;

private:
	void ResolveAttack();
	bool bCinematicLock = false;
	float StaggerEndTime = 0.f;
	FTimerHandle AttackTimer;
};
