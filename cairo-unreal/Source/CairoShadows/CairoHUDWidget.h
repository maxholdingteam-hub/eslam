#pragma once

#include "CoreMinimal.h"
#include "Blueprint/UserWidget.h"
#include "CairoTypes.h"
#include "CairoHUDWidget.generated.h"

class ACairoPlayerCharacter;
class ACairoGameMode;

// أساس واجهة اللعب: اعمل منه Widget Blueprint واربط البارات بالدوال دي
UCLASS(Abstract)
class CAIROSHADOWS_API UCairoHUDWidget : public UUserWidget
{
	GENERATED_BODY()

public:
	UFUNCTION(BlueprintPure, Category = "Cairo") float GetHealthPercent() const;
	UFUNCTION(BlueprintPure, Category = "Cairo") int32 GetStamina() const;
	UFUNCTION(BlueprintPure, Category = "Cairo") FText GetStatusText() const;
	UFUNCTION(BlueprintPure, Category = "Cairo") EVisibilityStatus GetStatus() const;
	UFUNCTION(BlueprintPure, Category = "Cairo") FText GetObjectiveText() const;
	UFUNCTION(BlueprintPure, Category = "Cairo") FText GetPromptText() const;
	UFUNCTION(BlueprintPure, Category = "Cairo") bool HasPrompt() const;

protected:
	ACairoPlayerCharacter* GetCairoPlayer() const;
	ACairoGameMode* GetCairoGameMode() const;
};
