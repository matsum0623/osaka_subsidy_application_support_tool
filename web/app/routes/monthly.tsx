import {
  useNavigate,
  useLoaderData,
  redirect,
  Outlet,
  ClientLoaderFunctionArgs,
} from "@remix-run/react";
import { getData } from "~/api/fetchApi";
import { getIdToken } from "~/api/auth";
import { Header } from "~/components/header";
import { useRef } from "react";

export const clientLoader = async ({
  params,
}: ClientLoaderFunctionArgs) => {
  const idToken = await getIdToken();
  if (!idToken){
    return redirect(`/`)
  }

  const today = new Date()
  const today_year = today.getFullYear()
  const today_month = today.getMonth() + 1
  const data = await getData("/user", idToken)
  data.ym = params.ym
  data.ym_list = []
  for(let i=0; i < 13; i++){
    data.ym_list.push({
      value: ((i<=today_month) ? today_year : today_year-1) + '-' + ('0' + ( (i < today_month) ? today_month - i : today_month - i + 12)).slice(-2),
      confirm: false
    })
  }
  return data
};

export default function Index() {
  const data = useLoaderData<typeof clientLoader>()
  const navigate = useNavigate();
  if (!data.idToken){
    redirect("/");
  }

  const changeMonth = (ym:string) => {
    return navigate("/monthly/" + ym);
  }

  const dialogRef = useRef<HTMLDialogElement>(null);
  const openDialog = () => {
    if (dialogRef.current) {
      dialogRef.current.showModal();
    }
  };

  return (
    <div>
      {Header(data.user_data)}
      <div className="monthly-header">
        <div>
          月度:<select name="ym" defaultValue={data.ym} onChange={(e) => (changeMonth(e.target.value))}>
            {data.ym_list.map((item:any) => (
                <option key={item.value} value={item.value}>{item.value.split('-').join('年') + '月' + (item.confirm ? ' 確定済み' : '')}</option>
            ))}
          </select>
        </div>
        {/* TODO: 確定処理は未実装
        <div>
          <button type="button" value={"確定"} className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#confirm_modal" onClick={() => openDialog()}>確定処理</button>
        </div>
        */}
      </div>
      <Outlet />
    </div>
  );
}
