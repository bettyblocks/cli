const arrow = ({
  event,
  price,
  quantity,
}: {
  event: Event;
  price: number;
  quantity: number;
}): number => quantity * price;
