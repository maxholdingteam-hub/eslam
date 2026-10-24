#include "CairoGameMode.h"
#include "CairoPlayerCharacter.h"
#include "GuardCharacter.h"
#include "GuardAIController.h"
#include "CivilianCharacter.h"
#include "Kismet/GameplayStatics.h"
#include "EngineUtils.h"

#define LOCTEXT_NAMESPACE "Cairo"

ACairoGameMode::ACairoGameMode()
{
	DefaultPawnClass = ACairoPlayerCharacter::StaticClass();
	PrimaryActorTick.bCanEverTick = false;
}

void ACairoGameMode::BeginPlay()
{
	Super::BeginPlay();
	StartTime = GetWorld()->GetTimeSeconds();
	for (TActorIterator<AGuardCharacter> It(GetWorld()); It; ++It) if (It->bIsTarget) { Target = *It; break; }
	TArray<AActor*> Gates;
	UGameplayStatics::GetAllActorsWithTag(this, TEXT("CitadelGate"), Gates);
	if (Gates.Num()) CitadelGate = Gates[0];
	Banner(LOCTEXT("start_t", "القاهرة"), LOCTEXT("start_s", "ربيع ١٨٠٥"));
}

bool ACairoGameMode::AnyGuardAlerted() const
{
	for (TActorIterator<AGuardCharacter> It(GetWorld()); It; ++It) if (!It->IsDead() && It->IsAlerted()) return true;
	return false;
}

bool ACairoGameMode::AnyGuardSuspicious() const
{
	for (TActorIterator<AGuardCharacter> It(GetWorld()); It; ++It)
		if (!It->IsDead() && (It->State == EGuardState::Suspicious || It->State == EGuardState::Search)) return true;
	return false;
}

FText ACairoGameMode::GetObjectiveText() const
{
	if (Objective == EMissionObjective::Escape) return LOCTEXT("obj_escape", "اهرب للبيت الآمن — لازم ماحدش يكون وراك");
	if (Target && Target->State == EGuardState::Flee) return LOCTEXT("obj_flee", "حسن آغا بيهرب على باب القلعة! الحقه");
	if (bTargetRevealed) return LOCTEXT("obj_kill", "اغتال حسن آغا — بيلم الإتاوات في سوق خان الخليلي");
	return LOCTEXT("obj_find", "اغتال حسن آغا — اطلع مئذنة الأزهر تكشف مكانه");
}

bool ACairoGameMode::TryAcquireAttackToken()
{
	if (ActiveAttackers >= MaxSimultaneousAttackers) return false;
	ActiveAttackers++;
	return true;
}

void ACairoGameMode::NotifyCharacterKilled(ACairoCharacterBase* Victim, ACairoCharacterBase* Killer, bool bSilent)
{
	if (Cast<ACairoPlayerCharacter>(Victim))
	{
		EndMission(false, LOCTEXT("dead", "يوسف وقع في إيد الإنكشارية… والذكرى دي ماحصلتش كده."));
		return;
	}
	AGuardCharacter* G = Cast<AGuardCharacter>(Victim);
	if (!G) return;
	if (!G->bIsTarget) GuardsKilled++;

	// الشهود: الحراس اللي شايفين المكان بيتنبهوا، والأهالي بيجروا
	const FVector At = G->GetActorLocation();
	const FVector KillerAt = Killer ? Killer->GetActorLocation() : At;
	for (TActorIterator<AGuardCharacter> It(GetWorld()); It; ++It)
	{
		if (*It == G || It->IsDead() || It->IsAlerted()) continue;
		FHitResult Hit;
		const FVector Eye = It->GetActorLocation() + FVector(0, 0, 70.f);
		if (FVector::Dist(Eye, At) > It->SightRange) continue;
		FCollisionQueryParams Q(SCENE_QUERY_STAT(CairoWitness), false, *It);
		Q.AddIgnoredActor(G);
		if (Killer) Q.AddIgnoredActor(Killer);
		if (GetWorld()->LineTraceSingleByChannel(Hit, Eye, At, ECC_Visibility, Q)) continue;
		if (FVector::DotProduct((At - Eye).GetSafeNormal2D(), It->GetActorForwardVector()) < 0.2f && FVector::Dist(Eye, At) > 300.f) continue;
		G->bBodyFound = true;
		if (AGuardAIController* C = Cast<AGuardAIController>(It->GetController())) C->OnWitnessedKill(KillerAt);
	}
	bool bScream = false;
	for (TActorIterator<ACivilianCharacter> It(GetWorld()); It; ++It)
	{
		if (FVector::Dist(It->GetActorLocation(), At) < 1200.f) { It->FleeFrom(At); bScream = true; }
	}
	if (bScream)
	{
		for (TActorIterator<AGuardCharacter> It(GetWorld()); It; ++It)
		{
			if (It->IsDead() || It->IsAlerted() || It->bIsTarget) continue;
			if (FVector::Dist(It->GetActorLocation(), At) < 1800.f)
				if (AGuardAIController* C = Cast<AGuardAIController>(It->GetController())) C->StartSearch(At);
		}
	}
	if (G->bIsTarget)
	{
		Objective = EMissionObjective::Escape;
		Heat = 1.4f;
		Banner(LOCTEXT("killed_t", "حسن آغا مات"), LOCTEXT("killed_s", "«فاكر إنك غيّرت حاجة؟ الألباني اللي جاي أخطر مننا كلنا.»"));
	}
}

void ACairoGameMode::NotifyBodyFound(const FVector& Location)
{
	Heat = FMath::Max(Heat, 1.35f);
	if (Target && !Target->IsDead() && FVector::Dist(Location, Target->GetActorLocation()) < 2000.f)
		if (AGuardAIController* C = Cast<AGuardAIController>(Target->GetController())) C->StartFlee();
}

void ACairoGameMode::Synchronize()
{
	if (bSynchronized) return;
	bSynchronized = true;
	RevealTarget();
	Banner(LOCTEXT("sync_t", "تمت المزامنة"), LOCTEXT("sync_s", "حسن آغا ظهر قدامك"));
}

void ACairoGameMode::RevealTarget()
{
	bTargetRevealed = true;
	if (Objective == EMissionObjective::FindTarget) Objective = EMissionObjective::KillTarget;
}

void ACairoGameMode::OnTargetFleeing()
{
	bTargetRevealed = true;
	Banner(LOCTEXT("flee_t", "حسن آغا بيهرب!"), LOCTEXT("flee_s", "الحقه قبل ما يوصل باب القلعة"));
}

void ACairoGameMode::PlayerReachedSafehouse()
{
	if (Objective != EMissionObjective::Escape) return;
	if (AnyGuardAlerted())
	{
		Banner(LOCTEXT("door_t", "فيه عسكر وراك!"), LOCTEXT("door_s", "ضيّعهم الأول قبل ما تدخل البيت"));
		return;
	}
	EndMission(true, LOCTEXT("win", "حسن آغا مات، ودكاكين خان الخليلي مش هتدفع إتاوة تاني."));
}

void ACairoGameMode::MissionFailed(const FText& Reason) { EndMission(false, Reason); }

void ACairoGameMode::EndMission(bool bWin, const FText& Reason)
{
	if (bEnded) return;
	bEnded = true;
	Objective = bWin ? EMissionObjective::Complete : EMissionObjective::Failed;
	UGameplayStatics::SetGlobalTimeDilation(this, 1.f);
	OnMissionEnded(bWin, Reason);
}

void ACairoGameMode::RestartMission()
{
	UGameplayStatics::OpenLevel(this, FName(*UGameplayStatics::GetCurrentLevelName(this)));
}

#undef LOCTEXT_NAMESPACE
