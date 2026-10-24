#include "CairoHUDWidget.h"
#include "CairoPlayerCharacter.h"
#include "CairoGameMode.h"
#include "Kismet/GameplayStatics.h"

#define LOCTEXT_NAMESPACE "Cairo"

ACairoPlayerCharacter* UCairoHUDWidget::GetCairoPlayer() const { return Cast<ACairoPlayerCharacter>(GetOwningPlayerPawn()); }
ACairoGameMode* UCairoHUDWidget::GetCairoGameMode() const { return GetWorld() ? GetWorld()->GetAuthGameMode<ACairoGameMode>() : nullptr; }

float UCairoHUDWidget::GetHealthPercent() const { const ACairoPlayerCharacter* P = GetCairoPlayer(); return P ? P->GetHealthPercent() : 0.f; }
int32 UCairoHUDWidget::GetStamina() const { const ACairoPlayerCharacter* P = GetCairoPlayer(); return P ? P->Stamina : 0; }
EVisibilityStatus UCairoHUDWidget::GetStatus() const { const ACairoPlayerCharacter* P = GetCairoPlayer(); return P ? P->GetVisibilityStatus() : EVisibilityStatus::Anonymous; }

FText UCairoHUDWidget::GetStatusText() const
{
	switch (GetStatus())
	{
	case EVisibilityStatus::Exposed:    return LOCTEXT("st_exposed", "مكشوف");
	case EVisibilityStatus::Hidden:     return LOCTEXT("st_hidden", "مستخبي");
	case EVisibilityStatus::Blended:    return LOCTEXT("st_blend", "وسط الناس");
	case EVisibilityStatus::Suspicious: return LOCTEXT("st_sus", "مشتبه فيه");
	default:                            return LOCTEXT("st_anon", "مجهول");
	}
}

FText UCairoHUDWidget::GetObjectiveText() const { const ACairoGameMode* GM = GetCairoGameMode(); return GM ? GM->GetObjectiveText() : FText::GetEmpty(); }
FText UCairoHUDWidget::GetPromptText() const { const ACairoPlayerCharacter* P = GetCairoPlayer(); return P ? P->GetContextLabel() : FText::GetEmpty(); }
bool UCairoHUDWidget::HasPrompt() const { const ACairoPlayerCharacter* P = GetCairoPlayer(); return P && P->CurrentContext.Action != EContextAction::None; }

#undef LOCTEXT_NAMESPACE
