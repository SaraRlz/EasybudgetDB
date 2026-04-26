export function applyRecurringMovements(currentUser) {
  if (!currentUser) return;

  const movements = JSON.parse(localStorage.getItem('movements')) || [];

  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7);

  const recurringMovements = movements.filter(
    (movement) => movement.userId === currentUser.id && movement.isRecurring && movement.type === 'expense',
  );

  const newMovements = [];

  recurringMovements.forEach((movement) => {
    const alreadyCreated = movements.some(
      (item) =>
        item.userId === currentUser.id && item.recurringParentId === movement.id && item.date?.startsWith(currentMonth),
    );

    const originalMonth = movement.date?.slice(0, 7);

    if (alreadyCreated || originalMonth === currentMonth) return;

    const day = movement.recurringDay || 1;
    const newDate = `${currentMonth}-${String(day).padStart(2, '0')}`;

    newMovements.push({
      ...movement,
      id: Date.now() + Math.random(),
      date: newDate,
      recurringParentId: movement.id,
      createdAutomatically: true,
    });
  });

  if (newMovements.length > 0) {
    localStorage.setItem('movements', JSON.stringify([...movements, ...newMovements]));
  }
}
