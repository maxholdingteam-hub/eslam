#pragma once

#include "CoreMinimal.h"
#include "AIController.h"
#include "GuardAIController.generated.h"

class AGuardCharacter;
class ACairoPlayerCharacter;
class ACairoCharacterBase;

// عقل الحارس: دورية، شك، مطاردة وقتال، تفتيش، ورجوع
UCLASS()
class CAIROSHADOWS_API AGuardAIController : public AAIController
{
	GENERATED_BODY()

public:
	AGuardAIController();
	virtual void Tick(float DeltaSeconds) override;
	virtual void OnPossess(APawn* InPawn) override;

	void SetAlert(bool bPropagated = false);
	void StartSearch(const FVector& Location);
	void StartFlee();
	void OnDamaged(ACairoCharacterBase* Attacker);
	void OnWitnessedKill(const FVector& KillerLocation);

	FVector LastKnown = FVector::ZeroVector;

private:
	AGuardCharacter* Guard() const;
	ACairoPlayerCharacter* Player() const;
	float CanSeePoint(const FVector& Point, bool bPointOnRoof, const AActor* Ignore) const;
	void Perceive(float DeltaSeconds);
	void CheckBodies();
	void TickPatrol(float DeltaSeconds);
	void TickSuspicious(float DeltaSeconds);
	void TickAlert(float DeltaSeconds);
	void TickSearch(float DeltaSeconds);
	void TickReturn(float DeltaSeconds);
	void TickTarget(float DeltaSeconds);
	void FaceTowards(const FVector& P);

	bool bSeesPlayer = false;
	float LostTime = 0.f;
	float StateTime = 0.f;
	float WaitTime = 0.f;
	float RepathTime = 0.f;
	float ShootTime = 0.f;
	int32 PatrolIndex = 0;
	FVector HomeLocation;
	FRotator HomeRotation;
	FVector SearchLocation;
	float SearchBaseYaw = 0.f;
};
