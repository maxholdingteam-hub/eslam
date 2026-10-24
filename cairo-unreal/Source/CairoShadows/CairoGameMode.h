#pragma once

#include "CoreMinimal.h"
#include "GameFramework/GameModeBase.h"
#include "CairoTypes.h"
#include "CairoGameMode.generated.h"

class ACairoCharacterBase;
class AGuardCharacter;

DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnCairoBanner, const FText&, Title, const FText&, Subtitle);

// منطق المهمة: الهدف، المزامنة، الهروب، الفوز والخسارة
UCLASS()
class CAIROSHADOWS_API ACairoGameMode : public AGameModeBase
{
	GENERATED_BODY()

public:
	ACairoGameMode();
	virtual void BeginPlay() override;

	UPROPERTY(BlueprintReadOnly, Category = "Cairo") EMissionObjective Objective = EMissionObjective::FindTarget;
	UPROPERTY(BlueprintReadOnly, Category = "Cairo") TObjectPtr<AGuardCharacter> Target;
	UPROPERTY(BlueprintReadOnly, Category = "Cairo") TObjectPtr<AActor> CitadelGate;
	UPROPERTY(BlueprintReadOnly, Category = "Cairo") bool bSynchronized = false;
	UPROPERTY(BlueprintReadOnly, Category = "Cairo") bool bTargetRevealed = false;
	UPROPERTY(BlueprintReadOnly, Category = "Cairo") int32 Detections = 0;
	UPROPERTY(BlueprintReadOnly, Category = "Cairo") int32 GuardsKilled = 0;
	UPROPERTY(BlueprintReadOnly, Category = "Cairo") float Heat = 1.f;
	UPROPERTY(EditAnywhere, Category = "Cairo") int32 MaxSimultaneousAttackers = 2;

	UPROPERTY(BlueprintAssignable, Category = "Cairo") FOnCairoBanner OnBanner;

	UFUNCTION(BlueprintPure, Category = "Cairo") bool AnyGuardAlerted() const;
	UFUNCTION(BlueprintPure, Category = "Cairo") bool AnyGuardSuspicious() const;
	UFUNCTION(BlueprintPure, Category = "Cairo") FText GetObjectiveText() const;
	UFUNCTION(BlueprintPure, Category = "Cairo") float GetMissionTime() const { return GetWorld()->GetTimeSeconds() - StartTime; }

	// نهاية المهمة: اعمل ويدجت النهاية في بلوبرينت من الحدث ده
	UFUNCTION(BlueprintImplementableEvent, Category = "Cairo") void OnMissionEnded(bool bWin, const FText& Reason);
	UFUNCTION(BlueprintCallable, Category = "Cairo") void RestartMission();

	void NotifyCharacterKilled(ACairoCharacterBase* Victim, ACairoCharacterBase* Killer, bool bSilent);
	void NotifyBodyFound(const FVector& Location);
	void NotifyDetected() { Detections++; }
	void Synchronize();
	void RevealTarget();
	void OnTargetFleeing();
	void PlayerReachedSafehouse();
	void MissionFailed(const FText& Reason);
	bool TryAcquireAttackToken();
	void ReleaseAttackToken() { ActiveAttackers = FMath::Max(0, ActiveAttackers - 1); }

private:
	void Banner(const FText& T, const FText& S) { OnBanner.Broadcast(T, S); }
	void EndMission(bool bWin, const FText& Reason);
	int32 ActiveAttackers = 0;
	float StartTime = 0.f;
	bool bEnded = false;
};
