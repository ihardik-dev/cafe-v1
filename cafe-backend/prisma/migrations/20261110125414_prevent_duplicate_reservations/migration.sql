CREATE UNIQUE INDEX "Reservation_userId_reservationDateTime_confirmed_key"
ON "Reservation" ("userId", "reservationDateTime")
WHERE "status" = 'CONFIRMED';