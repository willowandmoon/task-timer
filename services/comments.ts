export type ServerComment = {
  id: string;
  todoId: string;
  content: string;
  createdAt: string;
};

export async function fetchComments(todoId: string): Promise<ServerComment[]> {
  const res = await fetch(`/api/comments/${todoId}`);
  if (!res.ok) return [];
  return res.json();
}

export async function createComment(
  todoId: string,
  content: string
): Promise<ServerComment> {
  const res = await fetch("/api/comments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ todoId, content }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "No se pudo crear el comentario");
  }
  return res.json();
}
