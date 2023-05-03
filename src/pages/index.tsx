import { useState } from "react";
import Head from "next/head";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";

import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/lib/supabase";

const inter = Inter({ subsets: ["latin"] });

const createUserFormSchema = z.object({
  // avatar: z
  //   .custom((value) => {
  //     if (value instanceof FileList) {
  //       const file = value.item(0);
  //       if (file instanceof File) {
  //         return file;
  //       } else {
  //         throw new Error("Arquivo inválido");
  //       }
  //     } else if (value instanceof File) {
  //       return value;
  //     } else {
  //       throw new Error("Arquivo inválido");
  //     }
  //   })
  //   .refine(
  //     (file): file is File =>
  //       file instanceof File && file.size <= 5 * 1024 * 1024,
  //     {
  //       message: "O arquivo não pode ter mais de 5 MBs",
  //     }
  //   ),
  name: z
    .string()
    .nonempty("O nome é obrigatório")
    .transform((name) => {
      return name
        .toLowerCase()
        .trim()
        .split(" ")
        .map((word) => {
          return word[0].toLocaleUpperCase().concat(word.substring(1));
        })
        .join(" ");
    }),
  email: z
    .string()
    .nonempty("O e-mail é obrigatório")
    .email("Formato de e-mail inválido")
    .toLowerCase()
    .refine((email) => {
      return !email.endsWith("@gmail.com");
    }, "O e-mail deve ser de domínio próprio"),
  password: z.string().min(6, "A senha precisa de pelo menos 6 caracteres"),
  techs: z
    .array(
      z.object({
        title: z.string().nonempty("O título é obrigatório"),
        knowledge: z.coerce.number().min(1).max(100),
      })
    )
    .min(2, "Insira pelo menos 2 tecnologias"),
});

// Superrefine -- retorna validação de todos os campos
// útil para confirmação de senha

type CreateUserFormData = z.infer<typeof createUserFormSchema>;

export default function Home() {
  const [output, setOutput] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserFormSchema),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "techs",
  });

  function addNewTech() {
    append({ title: "", knowledge: 0 });
  }

  function createUser(data: CreateUserFormData) {
    // console.log(data.avatar);
    // await supabase.storage
    //   .from("forms-react")
    //   .upload(data.avatar.name, data.avatar);
    setOutput(JSON.stringify(data, null, 2));
  }

  return (
    <>
      <Head>
        <title>Formulários Avançados | Hook Form & Zod</title>
        <meta
          name="description"
          content="Trabalhando com Formulários no react"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${styles.main} ${inter.className}`}>
        <form
          onSubmit={handleSubmit(createUser)}
          className={styles.form}
          encType="multipart/form-data"
        >
          {/* <div>
            <label htmlFor="avatar">Avatar</label>
            <input
              type="file"
              id="avatar"
              accept="image/*"
              {...register("avatar")}
            />
            {errors.avatar && (
              <span className={styles.error}>{errors.avatar.message}</span>
            )}
          </div> */}

          <div>
            <label htmlFor="name">Nome</label>
            <input type="text" id="name" {...register("name")} />
            {errors.name && (
              <span className={styles.error}>{errors.name.message}</span>
            )}
          </div>

          <div>
            <label htmlFor="email">E-mail</label>
            <input type="email" id="email" {...register("email")} />
            {errors.email && (
              <span className={styles.error}>{errors.email.message}</span>
            )}
          </div>

          <div>
            <label htmlFor="password">Senha</label>
            <input type="password" id="password" {...register("password")} />
            {errors.password && (
              <span className={styles.error}>{errors.password.message}</span>
            )}
          </div>

          <div>
            <label htmlFor="techs" className={styles.techs}>
              Tecnologias
              <button type="button" onClick={addNewTech}>
                Adicionar
              </button>
            </label>

            {fields.map((field, index) => {
              return (
                <div className={styles.techItem} key={field.id}>
                  <input
                    type="text"
                    {...register(`techs.${index}.title`)}
                    placeholder="Nome da tecnologia"
                  />
                  {errors.techs?.[index]?.title && (
                    <span className={styles.error}>
                      {errors.techs?.[index]?.title?.message}
                    </span>
                  )}
                  <input
                    type="number"
                    {...register(`techs.${index}.knowledge`)}
                    placeholder="Nível de conhecimento"
                  />
                  {errors.techs?.[index]?.knowledge && (
                    <span className={styles.error}>
                      {errors.techs?.[index]?.knowledge?.message}
                    </span>
                  )}
                </div>
              );
            })}
            {errors.techs && (
              <span className={styles.error}>{errors.techs.message}</span>
            )}
          </div>

          <button type="submit">Salvar</button>
        </form>
        <pre>{output}</pre>
      </main>
    </>
  );
}
