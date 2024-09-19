import {
  useNavigate,
  useLoaderData,
  redirect,
  Outlet,
  ClientLoaderFunctionArgs,
  Form,
  useMatches,
} from "@remix-run/react";
import { getData } from "~/api/fetchApi";
import { getIdToken } from "~/api/auth";
import { Header } from "~/components/header";
import { useRef, useState } from "react";
import Encoding from 'encoding-japanese';

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
  data.idToken = idToken
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

export const downloadCsv = async (ym:string, idToken:string, anchorRef:any) => {
  const data = await getData("/monthly?ym=" + ym, idToken)
  const blob = new Blob([
    new Uint8Array(
      Encoding.convert(Encoding.stringToCode(data.list.map((row:any) => ([
        ...row.slice(0,1),
        ...row.slice(4,11),
        ...row.slice(12),
      ]).join(',')).join('\n')), {
        from: 'UNICODE',
        to: 'SJIS',
      })
    )
  ], {type: 'text/csv;charset=cp932;'})
  const link = anchorRef.current
  link.setAttribute('href', URL.createObjectURL(blob))
  link.setAttribute('download', 'test.csv')
  link.click()
}

export default function Index() {
  const data = useLoaderData<typeof clientLoader>()
  const navigate = useNavigate();
  if (!data.idToken){
    redirect("/");
  }
  const [ym, setDate] = useState(data.ym)

  const changeMonth = (ym:string) => {
    setDate(ym)
    return navigate("/monthly/" + ym);
  }

  const dialogRef = useRef<HTMLDialogElement>(null);
  const openDialog = () => {
    if (dialogRef.current) {
      dialogRef.current.showModal();
    }
  };

  const anchorRef  = useRef<HTMLAnchorElement>(null)
  const params = useMatches()

  return (
    <div>
      {Header(data.user_data)}
      <div className="monthly-header">
        <Form>
          <div className="d-flex">
            <div className="p-2">
              <select name="ym" className="form-select" defaultValue={data.ym} onChange={(e) => (changeMonth(e.target.value))}>
                {data.ym_list.map((item:any) => (
                  <option key={item.value} value={item.value}>{item.value.split('-').join('年') + '月' + (item.confirm ? ' 確定済み' : '')}</option>
                ))}
              </select>
            </div>
            <div className="ms-auto p-2" hidden={params[2].pathname.indexOf('/edit/') > 0}>
              <button type="button" onClick={() => downloadCsv(ym, data.idToken, anchorRef)} className="btn btn-primary ml-10">CSVダウンロード</button>
              <a ref={anchorRef} className='hidden'></a>
            </div>
          </div>
        </Form>
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
