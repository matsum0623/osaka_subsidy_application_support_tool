import {
  useLoaderData,
  redirect,
  ClientLoaderFunctionArgs,
} from "@remix-run/react";
import { getIdToken } from "~/api/auth";
import { getData } from "~/api/fetchApi";

export const clientLoader = async ({
  params,
}: ClientLoaderFunctionArgs) => {
  // データを取ってくる
  const idToken = await getIdToken();
  console.log(params)
  if (!idToken){
    return redirect(`/`)
  }else{
    const data = await getData("/after_school/" + params.school_id, idToken)
    return {
      idToken: idToken,
    };
  }
};

export default function Index() {
  const data = useLoaderData<typeof clientLoader>()
  if (!data.idToken){
    redirect("/");
  }

  return (
    <div>
      学童情報編集
    </div>
  );
}
