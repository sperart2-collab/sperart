"use client";
export default function ConfirmDelete() {
  return <button className="text-red-600 underline" onClick={(e) => { if (!confirm("Delete permanently?")) e.preventDefault(); }}>Delete</button>;
}
