import {
  useNavigate,
  useLoaderData,
  redirect,
  Outlet,
} from "@remix-run/react";
import { getData } from "~/api/fetchApi";
import { getIdToken } from "~/api/auth";
import { Header } from "~/components/header";
import { useRef } from "react";

export const clientLoader = async () => {
  const idToken = await getIdToken();
  if (!idToken){
    return redirect(`/`)
  }

  const today = new Date()
  const data = await getData("/user", idToken)
  data.ym = today.getFullYear() + '-' + ('0' + (today.getMonth() + 1)).slice(-2)
  data.ym_list = [
    {value: '2024-04', confirm: true},
    {value: '2024-05', confirm: true},
    {value: '2024-06', confirm: false},
    {value: '2024-07', confirm: false},
  ]
  return data
};

export default function Index() {
  const data = useLoaderData<typeof clientLoader>()
  const navigate = useNavigate();
  if (!data.idToken){
    redirect("/");
  }
  const changeMonth = (ym:string) => {
    navigate("/monthly/" + ym);
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
            {data.ym_list.map((item) => (
                <option key={item.value} value={item.value} >{item.value.split('-').join('月') + '日' + (item.confirm ? ' 確定済み' : '')}</option>
            ))}
          </select>
        </div>
        <div>
          <button type="button" value={"確定"} className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#confirm_modal" onClick={() => openDialog()}>確定処理</button>
        </div>
      </div>
      <Outlet />
    </div>
  );
}
