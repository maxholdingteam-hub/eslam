#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Character.h"
#include "AIController.h"
#include "CivilianCharacter.generated.h"

// أهالي القاهرة: بيتمشوا، يقفوا عند الدكاكين، ويجروا لو حصل قتل
UCLASS()
class CAIROSHADOWS_API ACivilianCharacter : public ACharacter
{
	GENERATED_BODY()

public:
	ACivilianCharacter();

	UPROPERTY(EditInstanceOnly, Category = "Cairo", meta = (ToolTip = "لو مفعّل بيفضل واقف مكانه (زبون عند دكان)"))
	bool bStationary = false;

	UPROPERTY(EditAnywhere, Category = "Cairo") float WanderRadius = 2500.f;

	UPROPERTY(BlueprintReadOnly, Category = "Cairo") bool bFleeing = false;

	UFUNCTION(BlueprintImplementableEvent, Category = "Cairo") void OnScream();

	void FleeFrom(const FVector& Danger);
};

UCLASS()
class CAIROSHADOWS_API ACivilianAIController : public AAIController
{
	GENERATED_BODY()

public:
	ACivilianAIController();
	virtual void Tick(float DeltaSeconds) override;

private:
	float WaitTime = 0.f;
};
