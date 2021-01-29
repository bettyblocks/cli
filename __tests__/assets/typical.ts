function subtotal({
  event,
  price,
  quantity,
}: {
  event: Event;
  price: number;
  quantity: number;
}): number {
  return price * quantity;
}
