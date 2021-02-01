// @ts-nocheck
function incompatibleType({
  event,
  price,
}: {
  event: Event;
  price: PriceType;
}): number {
  return price * 1;
}
