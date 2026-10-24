#include "CivilianCharacter.h"
#include "GameFramework/CharacterMovementComponent.h"
#include "NavigationSystem.h"
#include "Navigation/PathFollowingComponent.h"

ACivilianCharacter::ACivilianCharacter()
{
	AIControllerClass = ACivilianAIController::StaticClass();
	AutoPossessAI = EAutoPossessAI::PlacedInWorldOrSpawned;
	GetCharacterMovement()->MaxWalkSpeed = 120.f;
	GetCharacterMovement()->bOrientRotationToMovement = true;
	bUseControllerRotationYaw = false;
	Tags.Add(TEXT("Civilian"));
}

void ACivilianCharacter::FleeFrom(const FVector& Danger)
{
	if (bFleeing) return;
	bFleeing = true;
	bStationary = false;
	GetCharacterMovement()->MaxWalkSpeed = 450.f;
	OnScream();
	AAIController* C = Cast<AAIController>(GetController());
	UNavigationSystemV1* Nav = UNavigationSystemV1::GetCurrent<UNavigationSystemV1>(GetWorld());
	if (!C || !Nav) return;
	const FVector Away = (GetActorLocation() - Danger).GetSafeNormal2D();
	FNavLocation Out;
	if (Nav->GetRandomReachablePointInRadius(GetActorLocation() + Away * 1800.f, 600.f, Out)) C->MoveToLocation(Out.Location, 100.f);
}

ACivilianAIController::ACivilianAIController()
{
	PrimaryActorTick.bCanEverTick = true;
}

void ACivilianAIController::Tick(float DeltaSeconds)
{
	Super::Tick(DeltaSeconds);
	ACivilianCharacter* C = Cast<ACivilianCharacter>(GetPawn());
	if (!C || C->bStationary) return;
	if (GetMoveStatus() != EPathFollowingStatus::Idle) return;
	if (C->bFleeing)
	{
		C->bFleeing = false;
		C->GetCharacterMovement()->MaxWalkSpeed = 120.f;
		WaitTime = 3.f;
	}
	if (WaitTime > 0.f) { WaitTime -= DeltaSeconds; return; }
	UNavigationSystemV1* Nav = UNavigationSystemV1::GetCurrent<UNavigationSystemV1>(GetWorld());
	FNavLocation Out;
	if (Nav && Nav->GetRandomReachablePointInRadius(C->GetActorLocation(), C->WanderRadius, Out)) MoveToLocation(Out.Location, 80.f);
	WaitTime = 2.f + FMath::FRand() * 5.f;
}
