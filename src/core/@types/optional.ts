/**
 * Torna algumas propriedades de um tipo opcionais.
 *
 * @example
 * ```typescript
 * type Post {
 *  id: string;
 *  name: string;
 *  email: string;
 * }
 *
 * Optional<Post, 'id' | 'email'>
 * ```
 * Neste exemplo, o tipo `Optional<Post, 'id' | 'email'>` cria um novo tipo a partir de `Post`, onde as propriedades `id` e `email` se tornam opcionais, enquanto `name` permanece obrigatória. O tipo resultante permitirá a criação de objetos que podem ou não incluir as propriedades `id` e `email`.
 */
export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;
