import {
  useNavigate,
  ClientLoaderFunctionArgs,
  useLoaderData,
  redirect,
  Form,
  ClientActionFunctionArgs,
  Outlet,
  useOutletContext,
} from "@remix-run/react";
import { getData } from "~/api/fetchApi";
import { getIdToken } from "~/api/auth";
import { weekday } from "~/components/util"
import { useRef } from "react";

export const clientLoader = async ({
  params,
  request
}: ClientLoaderFunctionArgs) => {
  const idToken = await getIdToken();
  if (!idToken){
    return redirect(`/`)
  }

  const ym = params.ym
  const school_id = params.school_id
  const data = await getData("/monthly?ym=" + ym + '&school_id=' + school_id, idToken)
  return {
    idToken: idToken,
    list: data.list,
    /*
      TODO: 想定されるリスト内容をコメントに残す
    */
    config: data.config,
    school_id: school_id,
    ym: ym,
  };
};

export const clientAction = async ({
  request
}: ClientActionFunctionArgs) => {
  const form_data = Object.fromEntries(await request.formData())
  console.log('clientAction')
  console.log(form_data)
  return redirect("/monthly/" + form_data.ym)
}

export default function Index() {
  const data = useLoaderData<typeof clientLoader>()
  const navigate = useNavigate();
  if (!data.idToken){
    redirect("/");
  }
  const editClick = (dt:string) => {
    navigate("/monthly/edit/" + data.school_id + '/' + dt);
  };

  const dialogRef = useRef<HTMLDialogElement>(null);

  const closeDialog = () => {
    if (dialogRef.current) {
      dialogRef.current.close();
    }
  };

  const child_summary = {
    'children': 0,
    'disability': 0,
    'medical_care': 0,
    'open_qualification': 0,
    'open_non_qualification': 0,
    'close_qualification': 0,
    'close_non_qualification': 0,
  }
  data.list?.forEach((i:any) => {
    child_summary['children']                += parseInt(i[4]) > 0 ? parseInt(i[4])  : 0
    child_summary['disability']              += parseInt(i[5]) > 0 ? parseInt(i[5])  : 0
    child_summary['medical_care']            += parseInt(i[6]) > 0 ? parseInt(i[6])  : 0
    child_summary['open_qualification']      += parseInt(i[7]) > 0 ? parseInt(i[7])  : 0
    child_summary['open_non_qualification']  += parseInt(i[8]) > 0 ? parseInt(i[8])  : 0
    child_summary['close_qualification']     += parseInt(i[9]) > 0 ? parseInt(i[9])  : 0
    child_summary['close_non_qualification'] += parseInt(i[10]) > 0 ? parseInt(i[10])  : 0
  })

  return (
    <div>
      <Form method="post">
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
              <th rowSpan={2}>開所<br/>閉所</th>
              <th rowSpan={2}>配置</th>
              <th rowSpan={2}></th>
          </tr>
          <tr>
              <th>合計</th>
              <th>内、障がい児</th>
              <th>内、医ケア児</th>
              <th>支援員数</th>
              <th>支援員以外</th>
              <th>支援員数</th>
              <th>支援員以外</th>
          </tr>
          <tr key={'summary'}>
            <td colSpan={3}>合計</td>
            <td>{child_summary['children']}</td>
            <td>{child_summary['disability']}</td>
            <td>{child_summary['medical_care']}</td>
            <td>{child_summary['open_qualification']}</td>
            <td>{child_summary['open_non_qualification']}</td>
            <td>{child_summary['close_qualification']}</td>
            <td>{child_summary['close_non_qualification']}</td>
            <td colSpan={3}></td>
          </tr>
        </thead>

        <tbody>
          {data.list?.map((i:any) => (
            <tr key={i[0]} className={i[2]==6 ? "table-info" : (i[2]==0 ? "table-danger" : "")}>
              <td>{i[1]}</td>
              <td>{weekday[i[2]]}</td>
              <td>{(i[4] != '' && i[4] > 0) ? data.config.open_types[i[3]]?.TypeName : ''}</td>
              <td>{(i[4] != '' && i[4] > 0) ? i[4]  : ''}</td>
              <td>{(i[4] != '' && i[4] > 0) ? i[5]  : ''}</td>
              <td>{(i[4] != '' && i[4] > 0) ? i[6]  : ''}</td>
              <td>{(i[4] != '' && i[4] > 0) ? i[7]  : ''}</td>
              <td>{(i[4] != '' && i[4] > 0) ? i[8]  : ''}</td>
              <td>{(i[4] != '' && i[4] > 0) ? i[9]  : ''}</td>
              <td>{(i[4] != '' && i[4] > 0) ? i[10] : ''}</td>
              <td>
                <span className={(i[7] + i[8] >= 2 && i[9] + i[10] >= 2) ? 'instChkOK' : 'instChkNG'}>
                  {(i[4] != '' && i[4] > 0) ? (i[3] != '' ? ((i[7] + i[8] >= 2 && i[9] + i[10] >= 2)  ? 'OK' : 'NG') : '') : ''}
                </span>
              </td>
              <td><span className={i[3] != '' ? (i[11] ? 'instChkOK' : 'instChkNG') : ''}>{(i[4] != '' && i[4] > 0) ? (i[3] != '' ? (i[11] ? 'OK' : 'NG') : '') : ''}</span></td>
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
