#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "SafehouseZone.generated.h"

class UBoxComponent;

// البيت الآمن: توصله بعد الاغتيال من غير ما حد يكون وراك
UCLASS()
class CAIROSHADOWS_API ASafehouseZone : public AActor
{
	GENERATED_BODY()

public:
	ASafehouseZone();
	UPROPERTY(VisibleAnywhere, Category = "Cairo") TObjectPtr<UBoxComponent> Zone;

private:
	UFUNCTION() void OnEnter(UPrimitiveComponent* Comp, AActor* Other, UPrimitiveComponent* OtherComp, int32 BodyIndex, bool bFromSweep, const FHitResult& Sweep);
};
