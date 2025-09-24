"use client";

export const GreetingComp = () => {
  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? "Good Morning ☀️"
      : hour < 18
      ? "Good Afternoon 🌤️"
      : "Good Evening 🌙";

  return <span>{greeting}</span>;
};
