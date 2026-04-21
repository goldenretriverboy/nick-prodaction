import { z } from 'zod'

export const leadFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Введите имя от 2 символов')
    .max(80, 'Слишком длинное имя'),
  contact: z
    .string()
    .min(3, 'Укажите Telegram (@username) или номер телефона')
    .max(100, 'Слишком длинный контакт'),
  goal: z
    .string()
    .max(300, 'Цель обучения должна быть до 300 символов')
    .optional()
    .or(z.literal('')),
  selectedTariff: z.string().min(1, 'Выберите тариф'),
  consent: z.boolean().refine((value) => value, {
    message: 'Нужно согласие с политикой',
  }),
})

export type LeadFormValues = z.infer<typeof leadFormSchema>
