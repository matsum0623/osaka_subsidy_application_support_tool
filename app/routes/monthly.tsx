import {
  useNavigate,
  ClientLoaderFunctionArgs,
  useLoaderData,
  redirect,
  Form,
  ClientActionFunctionArgs,
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
  const data = await getData("/monthly?ym=" + ym)
  return {
    idToken: idToken,
    list: data.list,
    config: data.config,
    user_data: {
      'user_name': 'test_user',
      'admin': true,
    },
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
    navigate("/daily/edit/" + dt);
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
      <Form method="post">
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
        <div className="modal" id="confirm_modal" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">確定処理</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <p>確定しますか？</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" onClick={closeDialog}>キャンセル</button>
                <button type="submit" className="btn btn-primary" data-bs-dismiss="modal" onClick={closeDialog}>確定</button>
              </div>
            </div>
          </div>
        </div>
      </Form>
      <table className="table table-bordered table-hover text-center">
        <thead>
          <tr>
              <th rowSpan={2}>日付</th>
              <th rowSpan={2}>曜日</th>
              <th rowSpan={2}>開所<br/>種別</th>
              <th colSpan={3}>児童数</th>
              <th colSpan={2}>開所時職員数</th>
              <th colSpan={2}>閉所時職員数</th>
              <th rowSpan={2}></th>
          </tr>
          <tr>
              <th></th>
              <th>内、障がい児</th>
              <th>内、医ケア児</th>
              <th>支援員数</th>
              <th>支援員以外</th>
              <th>支援員数</th>
              <th>支援員以外</th>
          </tr>
        </thead>

        <tbody>
          {data.list?.map((i:any) => (
            <tr key={i[0]} className={i[2]==6 ? "table-info" : (i[2]==0 ? "table-danger" : "")}>
              <td>{i[1]}</td>
              <td>{weekday[i[2]]}</td>
              <td>{data.config.open_types[i[3]]?.TypeName}</td>
              <td>{i[4]}</td>
              <td>{i[5]}</td>
              <td>{i[6]}</td>
              <td>{i[7]}</td>
              <td>{i[8]}</td>
              <td>{i[9]}</td>
              <td>{i[10]}</td>
              <td>
                <button type="button" className="btn btn-primary" onClick={() => editClick(i[0])}>
                  入力
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
