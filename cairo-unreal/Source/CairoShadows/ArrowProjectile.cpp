#include "ArrowProjectile.h"
#include "CairoPlayerCharacter.h"
#include "Components/SphereComponent.h"
#include "Components/StaticMeshComponent.h"
#include "GameFramework/ProjectileMovementComponent.h"

AArrowProjectile::AArrowProjectile()
{
	Collision = CreateDefaultSubobject<USphereComponent>(TEXT("Collision"));
	RootComponent = Collision;
	Collision->InitSphereRadius(8.f);
	Collision->SetCollisionEnabled(ECollisionEnabled::QueryOnly);
	Collision->SetCollisionObjectType(ECC_WorldDynamic);
	Collision->SetCollisionResponseToAllChannels(ECR_Block);
	Collision->SetCollisionResponseToChannel(ECC_Pawn, ECR_Overlap);
	Collision->SetGenerateOverlapEvents(true);
	Collision->SetNotifyRigidBodyCollision(true);

	Mesh = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("Mesh"));
	Mesh->SetupAttachment(Collision);
	Mesh->SetCollisionEnabled(ECollisionEnabled::NoCollision);

	Movement = CreateDefaultSubobject<UProjectileMovementComponent>(TEXT("Movement"));
	Movement->InitialSpeed = 3200.f;
	Movement->MaxSpeed = 3200.f;
	Movement->ProjectileGravityScale = 0.15f;
	Movement->bRotationFollowsVelocity = true;
	InitialLifeSpan = 3.f;
}

void AArrowProjectile::BeginPlay()
{
	Super::BeginPlay();
	if (GetInstigator()) Collision->IgnoreActorWhenMoving(GetInstigator(), true);
	Collision->OnComponentHit.AddDynamic(this, &AArrowProjectile::OnHit);
	Collision->OnComponentBeginOverlap.AddDynamic(this, &AArrowProjectile::OnOverlap);
}

void AArrowProjectile::OnHit(UPrimitiveComponent* HitComp, AActor* Other, UPrimitiveComponent* OtherComp, FVector NormalImpulse, const FHitResult& Hit)
{
	Movement->StopMovementImmediately();
	SetLifeSpan(4.f); // السهم بيفضل مغروس في الحيطة شوية
	Collision->SetCollisionEnabled(ECollisionEnabled::NoCollision);
}

void AArrowProjectile::OnOverlap(UPrimitiveComponent* Comp, AActor* Other, UPrimitiveComponent* OtherComp, int32 BodyIndex, bool bFromSweep, const FHitResult& Sweep)
{
	ACairoPlayerCharacter* P = Cast<ACairoPlayerCharacter>(Other);
	if (!P || P->IsHiddenInSpot()) return;
	P->ReceiveEnemyAttack(Cast<ACairoCharacterBase>(GetInstigator()), Damage, false);
	Destroy();
}
