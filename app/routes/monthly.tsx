import {
  useNavigate,
  ClientLoaderFunctionArgs,
  useLoaderData,
  redirect,
  Form,
  ClientActionFunctionArgs,
  Outlet,
} from "@remix-run/react";
import { getData } from "~/api/fetchApi";
import { getIdToken } from "~/api/auth";
import { weekday } from "~/components/util"
import { Header } from "~/components/header";
import { useRef } from "react";

export const clientLoader = async ({
  request,
}: ClientLoaderFunctionArgs) => {
  const idToken = await getIdToken();
  if (!idToken){
    return redirect(`/`)
  }

  const today = new Date()
  const url = new URL(request.url);
  const ym = !url.searchParams.get("ym") ? today.getFullYear() + '-' + ('0' + (today.getMonth() + 1)).slice(-2) : url.searchParams.get("ym")
  const data = await getData("/monthly?ym=" + ym, idToken)
  return {
    idToken: idToken,
    list: data.list,
    config: data.config,
    user_data: data.user_data,
    ym: ym,
    ym_list: [
      {value: '2024-04', confirm: true},
      {value: '2024-05', confirm: true},
      {value: '2024-06', confirm: false},
      {value: '2024-07', confirm: false},
    ]
  };
};

export const clientAction = async ({
  request
}: ClientActionFunctionArgs) => {
  const form_data = Object.fromEntries(await request.formData())
  console.log('clientAction')
  console.log(form_data)
  return redirect("/monthly?ym=" + form_data.ym)
}

export default function Index() {
  const data = useLoaderData<typeof clientLoader>()
  const navigate = useNavigate();
  if (!data.idToken){
    redirect("/");
  }
  const editClick = (dt:string) => {
    navigate("/monthly/edit/" + dt);
  };
  const changeMonth = (ym:string) => {
    navigate("/monthly?ym=" + ym);
  }
  const confirmCheck = (e) => {
    console.log('check')
    console.log(e.target)
    console.log(e)
    return false
  }

  const dialogRef = useRef<HTMLDialogElement>(null);
  const openDialog = () => {
    if (dialogRef.current) {
      dialogRef.current.showModal();
    }
  };

  const closeDialog = () => {
    if (dialogRef.current) {
      dialogRef.current.close();
    }
  };

  return (
    <div>
      {Header(data.user_data)}
      <Outlet />
    </div>
  );
}
