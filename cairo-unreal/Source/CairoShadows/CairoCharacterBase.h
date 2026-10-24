#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Character.h"
#include "CairoCharacterBase.generated.h"

class UAnimMontage;

// الأساس المشترك بين يوسف والحراس: صحة، توازن، موت، جثة
UCLASS(Abstract)
class CAIROSHADOWS_API ACairoCharacterBase : public ACharacter
{
	GENERATED_BODY()

public:
	ACairoCharacterBase();

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Cairo|Stats")
	float MaxHealth = 100.f;

	UPROPERTY(VisibleInstanceOnly, BlueprintReadOnly, Category = "Cairo|Stats")
	float Health = 100.f;

	// التوازن: لما يتملي الحارس بيترنّح ويبقى جاهز للإعدام
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Cairo|Stats")
	float MaxStun = 100.f;

	UPROPERTY(VisibleInstanceOnly, BlueprintReadOnly, Category = "Cairo|Stats")
	float Stun = 0.f;

	UPROPERTY(EditAnywhere, Category = "Cairo|Anim")
	TObjectPtr<UAnimMontage> HitReactMontage;

	UPROPERTY(EditAnywhere, Category = "Cairo|Anim")
	TObjectPtr<UAnimMontage> DeathMontage;

	// بيتشغل على الضحية وقت الاغتيال (مع مونتاج اغتيال يوسف)
	UPROPERTY(EditAnywhere, Category = "Cairo|Anim")
	TObjectPtr<UAnimMontage> AssassinatedMontage;

	UFUNCTION(BlueprintPure, Category = "Cairo")
	bool IsDead() const { return bDead; }

	UFUNCTION(BlueprintPure, Category = "Cairo")
	float GetHealthPercent() const { return MaxHealth > 0.f ? Health / MaxHealth : 0.f; }

	UFUNCTION(BlueprintPure, Category = "Cairo")
	float GetStunPercent() const { return MaxStun > 0.f ? Stun / MaxStun : 0.f; }

	// ضربة جاية من حد تاني
	virtual void ApplyHit(ACairoCharacterBase* Attacker, float Damage, float StunAmount, bool bHeavy);

	// موت فوري (اغتيال/إعدام) أو بعد ما الصحة تخلص
	virtual void Die(ACairoCharacterBase* Killer, bool bSilent);

	float PlayMontageSafe(UAnimMontage* Montage, float Rate = 1.f);

	// الجثة
	FVector GetBodyLocation() const;
	bool bBodyHidden = false;
	bool bBodyCarried = false;
	bool bBodyFound = false;
	void PrepareForCarry(USceneComponent* AttachTo, FName Socket);
	void DropBody(const FVector& Location, bool bHideInSpot);

	UFUNCTION(BlueprintImplementableEvent, Category = "Cairo")
	void OnDied();

	UFUNCTION(BlueprintImplementableEvent, Category = "Cairo")
	void OnHitTaken(float Damage, bool bHeavy);

protected:
	virtual void BeginPlay() override;

	bool bDead = false;
	FTransform MeshRelativeTransform;
};
