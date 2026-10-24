#include "SafehouseZone.h"
#include "CairoGameMode.h"
#include "CairoPlayerCharacter.h"
#include "Components/BoxComponent.h"

ASafehouseZone::ASafehouseZone()
{
	Zone = CreateDefaultSubobject<UBoxComponent>(TEXT("Zone"));
	RootComponent = Zone;
	Zone->SetBoxExtent(FVector(100.f, 100.f, 100.f));
	Zone->SetCollisionProfileName(TEXT("OverlapAllDynamic"));
	Zone->OnComponentBeginOverlap.AddDynamic(this, &ASafehouseZone::OnEnter);
}

void ASafehouseZone::OnEnter(UPrimitiveComponent* Comp, AActor* Other, UPrimitiveComponent* OtherComp, int32 BodyIndex, bool bFromSweep, const FHitResult& Sweep)
{
	if (!Cast<ACairoPlayerCharacter>(Other)) return;
	if (ACairoGameMode* GM = GetWorld()->GetAuthGameMode<ACairoGameMode>()) GM->PlayerReachedSafehouse();
}
