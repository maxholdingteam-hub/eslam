#include "GuardAIController.h"
#include "GuardCharacter.h"
#include "CairoPlayerCharacter.h"
#include "CairoGameMode.h"
#include "Navigation/PathFollowingComponent.h"
#include "GameFramework/CharacterMovementComponent.h"
#include "Kismet/GameplayStatics.h"
#include "EngineUtils.h"

#define LOCTEXT_NAMESPACE "Cairo"

namespace CairoBarks
{
	FText Pick(std::initializer_list<FText> L) { const int32 I = FMath::RandRange(0, int32(L.size()) - 1); return *(L.begin() + I); }
	FText Sus()    { return Pick({ LOCTEXT("s1", "مين هناك؟"), LOCTEXT("s2", "إنت يا واد!"), LOCTEXT("s3", "استنى عندك…") }); }
	FText Alert()  { return Pick({ LOCTEXT("a1", "امسكوه!"), LOCTEXT("a2", "قاتل! قاتل!"), LOCTEXT("a3", "يا عسكر! هنا!") }); }
	FText Calm()   { return Pick({ LOCTEXT("c1", "يمكن كان خيال…"), LOCTEXT("c2", "ولا حاجة") }); }
	FText GiveUp() { return Pick({ LOCTEXT("g1", "راح فين ابن الحرام؟"), LOCTEXT("g2", "فص ملح وداب") }); }
	FText Found()  { return Pick({ LOCTEXT("f1", "جثة! فيه قاتل هنا!"), LOCTEXT("f2", "يا ساتر… قتلوه!") }); }
	FText Fight()  { return Pick({ LOCTEXT("x1", "خد دي!"), LOCTEXT("x2", "حاصروه!"), LOCTEXT("x3", "مش هتفلت!") }); }
}

AGuardAIController::AGuardAIController()
{
	PrimaryActorTick.bCanEverTick = true;
}

AGuardCharacter* AGuardAIController::Guard() const { return Cast<AGuardCharacter>(GetPawn()); }
ACairoPlayerCharacter* AGuardAIController::Player() const { return Cast<ACairoPlayerCharacter>(UGameplayStatics::GetPlayerCharacter(this, 0)); }

void AGuardAIController::OnPossess(APawn* InPawn)
{
	Super::OnPossess(InPawn);
	HomeLocation = InPawn->GetActorLocation();
	HomeRotation = InPawn->GetActorRotation();
	ShootTime = 2.f;
}

void AGuardAIController::FaceTowards(const FVector& P)
{
	if (APawn* Me = GetPawn())
	{
		FVector D = P - Me->GetActorLocation(); D.Z = 0.f;
		if (!D.IsNearlyZero()) Me->SetActorRotation(FMath::RInterpTo(Me->GetActorRotation(), D.Rotation(), GetWorld()->GetDeltaSeconds(), 8.f));
	}
}

float AGuardAIController::CanSeePoint(const FVector& Point, bool bPointOnRoof, const AActor* Ignore) const
{
	const AGuardCharacter* G = Guard();
	if (!G) return -1.f;
	const FVector Eye = G->GetActorLocation() + FVector(0, 0, 70.f);
	FVector D = Point - Eye;
	const float Dist = D.Size2D();
	const bool bGuardOnGround = G->GetActorLocation().Z < 250.f;
	const float Range = (bGuardOnGround && bPointOnRoof) ? G->SightRangeUpward : G->SightRange;
	if (Dist > Range) return -1.f;
	D.Z = 0.f;
	if (Dist > 250.f)
	{
		const float CosHalf = FMath::Cos(FMath::DegreesToRadians(G->FieldOfView * 0.5f));
		if (FVector::DotProduct(D.GetSafeNormal(), G->GetActorForwardVector()) < CosHalf) return -1.f;
	}
	FHitResult Hit;
	FCollisionQueryParams Q(SCENE_QUERY_STAT(CairoSight), false, G);
	if (Ignore) Q.AddIgnoredActor(Ignore);
	if (GetWorld()->LineTraceSingleByChannel(Hit, Eye, Point, ECC_Visibility, Q)) return -1.f;
	return Dist;
}

void AGuardAIController::Perceive(float DeltaSeconds)
{
	AGuardCharacter* G = Guard();
	ACairoPlayerCharacter* P = Player();
	bSeesPlayer = false;
	if (!G || !P || P->IsDead()) return;
	const bool bTowerOrHidden = P->IsHiddenInSpot() || P->Stance == EPlayerStance::AtViewPoint;
	float Dist = bTowerOrHidden ? -1.f : CanSeePoint(P->GetActorLocation() + FVector(0, 0, 30.f), P->IsOnRooftop(), P);
	if (Dist >= 0.f && P->IsBlendedInCrowd() && Dist > (G->IsAlerted() ? 500.f : 300.f)) Dist = -1.f;
	if (Dist < 0.f)
	{
		if (!G->IsAlerted()) G->Detection = FMath::Max(0.f, G->Detection - 0.14f * DeltaSeconds);
		return;
	}
	bSeesPlayer = true;
	LastKnown = P->GetActorLocation();
	if (G->IsAlerted()) { LostTime = 0.f; return; }

	float Rate = G->DetectionSpeed * (1.3f - Dist / G->SightRange);
	if (P->bSprinting) Rate *= 1.8f;
	if (P->IsAirborneOrClimbing()) Rate *= 1.6f;
	if (P->bCarrying) Rate *= 2.2f;
	if (P->IsBlendedInCrowd()) Rate *= 0.4f;
	if (P->Stance == EPlayerStance::Attacking) Rate *= 3.f;
	if (G->State == EGuardState::Search) Rate *= 1.6f;
	if (ACairoGameMode* GM = GetWorld()->GetAuthGameMode<ACairoGameMode>()) Rate *= GM->Heat;
	if (Dist < 300.f) Rate += 1.3f;
	G->Detection = FMath::Min(1.f, G->Detection + Rate * DeltaSeconds);

	if (G->Detection >= 1.f) SetAlert();
	else if (G->Detection > 0.3f && G->State != EGuardState::Suspicious && G->State != EGuardState::Search && !G->bIsTarget)
	{
		G->State = EGuardState::Suspicious;
		StateTime = 0.f;
		StopMovement();
		G->Bark(CairoBarks::Sus());
	}
}

void AGuardAIController::CheckBodies()
{
	AGuardCharacter* G = Guard();
	if (!G || G->IsAlerted()) return;
	for (TActorIterator<AGuardCharacter> It(GetWorld()); It; ++It)
	{
		AGuardCharacter* B = *It;
		if (!B->IsDead() || B->bBodyFound || B->bBodyHidden || B->bBodyCarried) continue;
		const FVector BL = B->GetBodyLocation();
		if (FVector::DistSquared2D(BL, G->GetActorLocation()) > 1400.f * 1400.f) continue;
		if (CanSeePoint(BL + FVector(0, 0, 20.f), BL.Z > 250.f, B) < 0.f) continue;
		B->bBodyFound = true;
		G->Bark(CairoBarks::Found());
		StartSearch(BL);
		G->Detection = FMath::Max(G->Detection, 0.5f);
		if (ACairoGameMode* GM = GetWorld()->GetAuthGameMode<ACairoGameMode>()) GM->NotifyBodyFound(BL);
		return;
	}
}

void AGuardAIController::SetAlert(bool bPropagated)
{
	AGuardCharacter* G = Guard();
	if (!G || G->IsDead()) return;
	ACairoGameMode* GM = GetWorld()->GetAuthGameMode<ACairoGameMode>();
	if (G->bIsTarget) { StartFlee(); return; }
	if (G->State != EGuardState::Alert && G->State != EGuardState::Stunned)
	{
		const bool bWasAny = GM && GM->AnyGuardAlerted();
		G->State = EGuardState::Alert;
		G->Detection = 1.f;
		LostTime = 0.f;
		RepathTime = 0.f;
		if (ACairoPlayerCharacter* P = Player()) if (LastKnown.IsZero()) LastKnown = P->GetActorLocation();
		if (!bPropagated || FMath::FRand() < 0.4f) G->Bark(CairoBarks::Alert());
		if (GM && !bWasAny) GM->NotifyDetected();
	}
	if (!bPropagated)
	{
		for (TActorIterator<AGuardCharacter> It(GetWorld()); It; ++It)
		{
			if (*It == G || It->IsDead() || It->IsAlerted()) continue;
			if (FVector::DistSquared(It->GetActorLocation(), G->GetActorLocation()) > 1600.f * 1600.f) continue;
			if (AGuardAIController* C = Cast<AGuardAIController>(It->GetController())) { C->LastKnown = LastKnown; C->SetAlert(true); }
		}
	}
	if (GM && GM->Target && !GM->Target->IsDead() && (G->EscortOf == GM->Target || FVector::Dist(G->GetActorLocation(), GM->Target->GetActorLocation()) < 1400.f))
	{
		if (AGuardAIController* TC = Cast<AGuardAIController>(GM->Target->GetController())) TC->StartFlee();
	}
}

void AGuardAIController::StartSearch(const FVector& Location)
{
	AGuardCharacter* G = Guard();
	if (!G || G->IsDead() || G->bIsTarget) return;
	G->State = EGuardState::Search;
	StateTime = 0.f;
	SearchLocation = Location;
	LastKnown = Location;
	SearchBaseYaw = G->GetActorRotation().Yaw;
	if (!G->bIsArcher) MoveToLocation(Location, 120.f);
}

void AGuardAIController::StartFlee()
{
	AGuardCharacter* G = Guard();
	if (!G || G->IsDead() || G->State == EGuardState::Flee) return;
	G->State = EGuardState::Flee;
	G->GetCharacterMovement()->MaxWalkSpeed = 460.f;
	G->Bark(LOCTEXT("flee", "يا عسكر! احموني!"));
	if (ACairoGameMode* GM = GetWorld()->GetAuthGameMode<ACairoGameMode>())
	{
		GM->OnTargetFleeing();
		if (GM->CitadelGate) MoveToLocation(GM->CitadelGate->GetActorLocation(), 80.f);
	}
}

void AGuardAIController::OnDamaged(ACairoCharacterBase* Attacker)
{
	if (Attacker) LastKnown = Attacker->GetActorLocation();
	AGuardCharacter* G = Guard();
	if (G && !G->IsAlerted() && !G->IsStunned()) SetAlert();
}

void AGuardAIController::OnWitnessedKill(const FVector& KillerLocation)
{
	LastKnown = KillerLocation;
	SetAlert();
}

void AGuardAIController::Tick(float DeltaSeconds)
{
	Super::Tick(DeltaSeconds);
	AGuardCharacter* G = Guard();
	if (!G || G->IsDead() || G->IsCinematicLocked()) return;
	StateTime += DeltaSeconds;
	if (G->bIsTarget) { TickTarget(DeltaSeconds); return; }
	if (G->IsStunned()) { StopMovement(); return; }
	Perceive(DeltaSeconds);
	CheckBodies();
	G->GetCharacterMovement()->MaxWalkSpeed = G->IsAlerted() ? 520.f : (G->State == EGuardState::Search ? 260.f : 140.f);
	switch (G->State)
	{
	case EGuardState::Patrol:     TickPatrol(DeltaSeconds); break;
	case EGuardState::Suspicious: TickSuspicious(DeltaSeconds); break;
	case EGuardState::Alert:      TickAlert(DeltaSeconds); break;
	case EGuardState::Search:     TickSearch(DeltaSeconds); break;
	case EGuardState::Return:     TickReturn(DeltaSeconds); break;
	default: break;
	}
}

void AGuardAIController::TickPatrol(float DeltaSeconds)
{
	AGuardCharacter* G = Guard();
	if (G->EscortOf)
	{
		if (G->EscortOf->IsDead()) { G->EscortOf = nullptr; HomeLocation = G->GetActorLocation(); return; }
		const FVector Behind = G->EscortOf->GetActorLocation() - G->EscortOf->GetActorForwardVector() * 180.f + G->EscortOf->GetActorRightVector() * (G->GetUniqueID() % 2 ? 90.f : -90.f);
		if (FVector::Dist2D(Behind, G->GetActorLocation()) > 80.f) MoveToLocation(Behind, 40.f);
		else FaceTowards(G->EscortOf->GetActorLocation() + G->EscortOf->GetActorForwardVector() * 300.f);
		return;
	}
	if (G->PatrolPoints.Num() == 0)
	{
		// حارس ثابت أو رامي: بيبص يمين وشمال
		if (FVector::Dist2D(HomeLocation, G->GetActorLocation()) > 60.f && !G->bIsArcher) { if (GetMoveStatus() == EPathFollowingStatus::Idle) MoveToLocation(HomeLocation, 30.f); return; }
		const float Yaw = HomeRotation.Yaw + FMath::Sin(GetWorld()->GetTimeSeconds() * 0.4f + G->GetActorLocation().X) * 50.f;
		G->SetActorRotation(FMath::RInterpTo(G->GetActorRotation(), FRotator(0, Yaw, 0), DeltaSeconds, 2.f));
		return;
	}
	if (WaitTime > 0.f) { WaitTime -= DeltaSeconds; return; }
	if (GetMoveStatus() == EPathFollowingStatus::Idle)
	{
		AActor* Pt = G->PatrolPoints[PatrolIndex % G->PatrolPoints.Num()];
		if (Pt && FVector::Dist2D(Pt->GetActorLocation(), G->GetActorLocation()) < 120.f)
		{
			PatrolIndex = (PatrolIndex + 1) % G->PatrolPoints.Num();
			WaitTime = G->PatrolWaitTime;
		}
		else if (Pt) MoveToLocation(Pt->GetActorLocation(), 60.f);
	}
}

void AGuardAIController::TickSuspicious(float DeltaSeconds)
{
	AGuardCharacter* G = Guard();
	FaceTowards(LastKnown);
	if (StateTime > 1.3f && !G->bIsArcher)
	{
		RepathTime -= DeltaSeconds;
		if (RepathTime <= 0.f) { MoveToLocation(LastKnown, 150.f); RepathTime = 1.f; }
	}
	if (G->Detection <= 0.02f)
	{
		G->State = EGuardState::Return;
		StopMovement();
		if (FMath::FRand() < 0.6f) G->Bark(CairoBarks::Calm());
	}
}

void AGuardAIController::TickAlert(float DeltaSeconds)
{
	AGuardCharacter* G = Guard();
	ACairoPlayerCharacter* P = Player();
	if (!P) return;
	if (!bSeesPlayer) LostTime += DeltaSeconds;
	if (LostTime > 4.f) { StartSearch(LastKnown); return; }
	const FVector D = P->GetActorLocation() - G->GetActorLocation();
	const float Dist = D.Size2D();
	const bool bSameLevel = FMath::Abs(D.Z) < 110.f;
	if (bSeesPlayer) FaceTowards(P->GetActorLocation());
	ACairoGameMode* GM = GetWorld()->GetAuthGameMode<ACairoGameMode>();

	if (G->bIsArcher)
	{
		ShootTime -= DeltaSeconds;
		if (bSeesPlayer && Dist < 200.f && bSameLevel)
		{
			if (GetWorld()->GetTimeSeconds() > G->NextAttackTime && GM && GM->TryAcquireAttackToken()) { G->BeginAttack(); if (!G->bWindingUp) GM->ReleaseAttackToken(); }
		}
		else if (bSeesPlayer && ShootTime <= 0.f) { G->FireArrow(P); ShootTime = G->ShootInterval + FMath::FRand(); }
		return;
	}
	if (bSeesPlayer && bSameLevel && Dist < 330.f)
	{
		StopMovement();
		if (G->bWindingUp) return;
		// مسافة القتال: بيقرب أو يبعد أو يلف حوالين يوسف
		const FVector Dir = FVector(D.X, D.Y, 0.f).GetSafeNormal();
		if (Dist > 210.f) G->AddMovementInput(Dir, 0.6f);
		else if (Dist < 130.f) G->AddMovementInput(-Dir, 0.5f);
		else G->AddMovementInput(FVector::CrossProduct(Dir, FVector::UpVector) * (G->GetUniqueID() % 2 ? 1.f : -1.f), 0.3f);
		if (GetWorld()->GetTimeSeconds() > G->NextAttackTime && Dist < G->AttackRange && GM && GM->TryAcquireAttackToken())
		{
			G->BeginAttack();
			if (!G->bWindingUp) GM->ReleaseAttackToken();
			else if (FMath::FRand() < 0.3f) G->Bark(CairoBarks::Fight());
		}
		return;
	}
	RepathTime -= DeltaSeconds;
	if (RepathTime <= 0.f) { MoveToLocation(LastKnown, 90.f, true, true, true); RepathTime = 0.5f; }
	if (bSeesPlayer && !bSameLevel && D.Z > 200.f && FMath::FRand() < DeltaSeconds * 0.3f) G->Bark(LOCTEXT("roof", "انزل يا جبان!"));
}

void AGuardAIController::TickSearch(float DeltaSeconds)
{
	AGuardCharacter* G = Guard();
	const bool bArrived = G->bIsArcher || GetMoveStatus() == EPathFollowingStatus::Idle;
	if (bArrived)
	{
		const float Yaw = SearchBaseYaw + FMath::Sin(StateTime * 1.4f) * 80.f;
		G->SetActorRotation(FMath::RInterpTo(G->GetActorRotation(), FRotator(0, Yaw, 0), DeltaSeconds, 3.f));
	}
	// تفتيش القش لو شافه داخل
	ACairoPlayerCharacter* P = Player();
	if (P && P->IsHiddenInSpot() && FVector::Dist(P->GetActorLocation(), G->GetActorLocation()) < 220.f && FVector::Dist(P->GetActorLocation(), LastKnown) < 250.f)
	{
		G->Bark(LOCTEXT("found_you", "لقيتك!"));
		LastKnown = P->GetActorLocation();
		SetAlert();
		P->LaunchCharacter(FVector(0, 0, 300.f) + (P->GetActorLocation() - G->GetActorLocation()).GetSafeNormal2D() * 300.f, true, true);
		return;
	}
	if (StateTime > 8.f)
	{
		G->State = EGuardState::Return;
		G->Detection = 0.f;
		if (FMath::FRand() < 0.7f) G->Bark(CairoBarks::GiveUp());
	}
}

void AGuardAIController::TickReturn(float DeltaSeconds)
{
	AGuardCharacter* G = Guard();
	if (G->PatrolPoints.Num() > 0 || G->EscortOf) { G->State = EGuardState::Patrol; return; }
	if (G->bIsArcher) { G->State = EGuardState::Patrol; return; }
	if (FVector::Dist2D(HomeLocation, G->GetActorLocation()) < 80.f) { G->State = EGuardState::Patrol; return; }
	if (GetMoveStatus() == EPathFollowingStatus::Idle) MoveToLocation(HomeLocation, 40.f);
}

void AGuardAIController::TickTarget(float DeltaSeconds)
{
	// حسن آغا: بيلف على الدكاكين، ولو حس بحاجة بيجري على القلعة
	AGuardCharacter* G = Guard();
	ACairoGameMode* GM = GetWorld()->GetAuthGameMode<ACairoGameMode>();
	if (G->State == EGuardState::Flee)
	{
		if (GM && GM->CitadelGate)
		{
			if (FVector::Dist2D(G->GetActorLocation(), GM->CitadelGate->GetActorLocation()) < 200.f) GM->MissionFailed(LOCTEXT("escaped", "حسن آغا وصل باب القلعة واتحصّن جوه."));
			else if (GetMoveStatus() == EPathFollowingStatus::Idle) MoveToLocation(GM->CitadelGate->GetActorLocation(), 80.f);
		}
		return;
	}
	ACairoPlayerCharacter* P = Player();
	if (P && !P->IsDead() && !P->IsHiddenInSpot())
	{
		float Dist = CanSeePoint(P->GetActorLocation() + FVector(0, 0, 30.f), P->IsOnRooftop(), P);
		if (Dist >= 0.f && P->IsBlendedInCrowd() && Dist > 300.f) Dist = -1.f;
		if (Dist >= 0.f)
		{
			G->Detection += (0.5f * (1.3f - Dist / G->SightRange) + (P->bSprinting ? 0.7f : 0.f) + (Dist < 300.f ? 0.9f : 0.f)) * DeltaSeconds;
			if (G->Detection >= 1.f) { StartFlee(); return; }
		}
		else G->Detection = FMath::Max(0.f, G->Detection - 0.1f * DeltaSeconds);
	}
	G->GetCharacterMovement()->MaxWalkSpeed = 120.f;
	TickPatrol(DeltaSeconds);
}

#undef LOCTEXT_NAMESPACE
