import {
  Form,
  useNavigate,
  useLoaderData,
  ClientLoaderFunctionArgs,
  ClientActionFunctionArgs,
  redirect,
  useParams,
} from "@remix-run/react"
import { useState } from "react";
import { getIdToken } from "~/api/auth";
import { getData, postData } from "~/api/fetchApi";
import { weekday } from "~/components/util";
import { checkInstructor } from "~/lib/common_check";

export const clientLoader = async ({
  params,
}: ClientLoaderFunctionArgs) => {
  // データを取ってくる
  const idToken = await getIdToken();
  if (!idToken){
    return redirect(`/`)
  }
  const data = await getData(`/monthly/daily?date=${params.dt}&school_id=${params.school_id}`, idToken)
  return data;
};

export const clientAction = async({
  request,
  params,
}: ClientActionFunctionArgs) => {
  const idToken = await getIdToken();
  if (!idToken){
    return redirect(`/`)
  }
  await postData("/monthly/daily", Object.fromEntries(await request.formData()), idToken)
  return redirect(`/monthly/edit/${params.school_id}/${params.dt}`);
}

export default function Edit() {
  const params:any = useParams()
  const navigate = useNavigate()
  const data = useLoaderData<typeof clientLoader>()
  const [instData, setInstData] = useState(data.instructors)
  const [sumHours, setSumHours] = useState(data.summary.hours)
  const [ct, setCt] = useState(0) // 再描画用のState
  const [instChk, setInstChk] = useState(checkInstructor(instData, data.config.open_types[data.open_type])) // 指導員の配置チェック

  const setHour = (target:any) => {
    const [id, k] = target.name.split('.').slice(-2)
    const start_time = (k == 'start') ? target.value : instData[id].start
    const end_time = (k == 'end') ? target.value : instData[id].end
    if (!start_time || !end_time){
      instData[id].start = start_time
      instData[id].end = end_time
    }else if (start_time >= end_time){
      // TODO: 不正な登録の場合は画面に表示する
      console.log("不正な時刻登録です", start_time, end_time)
      instData[id].hours = ''
    }else{
      const [start_hour, start_min] = start_time.split(':').map((i:any) => (parseInt(i)))
      const [end_hour, end_min] = end_time.split(':').map((i:any) => (parseInt(i)))
      const hour_min = start_min > end_min ? end_min - start_min + 60 : end_min - start_min
      const hour_hour = start_min > end_min ? end_hour - start_hour - 1 : end_hour - start_hour
      instData[id].hours = hour_hour + ':' + ( '00' + hour_min ).slice( -2 )
      instData[id].start = start_time
      instData[id].end = end_time
    }
    setInstData(instData)

    let sum_hour = 0
    let sum_min = 0
    Object.values(instData).map((inst:any) => {
      if (inst.hours){
        const [hour, min] = inst.hours.split(':')
        sum_hour += parseInt(hour)
        sum_min += parseInt(min)
      }
    })
    sum_hour += Math.floor(sum_min / 60)
    sum_min = sum_min % 60
    setSumHours(sum_hour + ':' + ( '00' + sum_min ).slice( -2 ))
    setCt(ct + 1)
  }
  const changeOpenType = (value:string) => {
    console.log(value)
  }
  const CancelClick = () => {
    navigate(`/monthly/${params.school_id}/${params.dt.slice(0, 7)}`)
  }

  const now_dt: Date = new Date(params.dt);
  const prev_dt: Date = new Date(params.dt);
  const next_dt: Date = new Date(params.dt);
  prev_dt.setDate(prev_dt.getDate() - 1);
  next_dt.setDate(next_dt.getDate() + 1);
  const instructors = Object.values(data.instructors).sort((a:any, b:any) => (a.order - b.order))

  return (
    <Form method="post">
      <div className="bg-white text-base border-t-2 sm:text-2xl flex gap-3 justify-center sm:justify-start sticky top-12 sm:top-20">
        <div>{params.dt}({weekday[now_dt.getDay()]})</div>
        <span className={(instChk ? 'text-green-500' : 'text-red-500 font-bold')}>{instChk ? "OK" : "NG"}</span>
        <a href={`/monthly/edit/${params.school_id}/${prev_dt.toISOString().slice(0, 10)}`}>
          <button type="button" className="btn-primary">前日</button>
        </a>
        <a href={`/monthly/edit/${params.school_id}/${next_dt.toISOString().slice(0, 10)}`}>
          <button type="button" className="btn-primary">翌日</button>
        </a>
      </div>

      {/* PC表示用 */}
      <table className="hidden sm:table table-bordered text-center mt-3 w-full">
        <thead>
          <tr>
            <th>開所パターン</th>
            <th>児童数</th>
            <th>障がい</th>
            <th>医ケア</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <select name="open_type" defaultValue={data.open_type} onChange={(e) => changeOpenType(e.target.value)}>
                {
                  Object.keys(data.config.open_types).map((key:string) => (
                    <option value={key} key={key}>{data.config.open_types[key].TypeName + "(" + data.config.open_types[key].OpenTime + "-" + data.config.open_types[key].CloseTime + ")"}</option>
                  ))
                }
              </select>
            </td>
            <td className="py-0.5"><input className="text-right input-default" name="children" type="number" defaultValue={data.children.sum}/></td>
            <td className="py-0.5"><input className="text-right input-default" name="disability" type="number" defaultValue={data.children.disability}/></td>
            <td className="py-0.5"><input className="text-right input-default" name="medical_care" type="number" defaultValue={data.children.medical_care}/></td>
          </tr>
        </tbody>
      </table>
      {/* スマホ表示用 */}
      <table className="table sm:hidden table-bordered text-center mt-3 w-full">
        <tbody>
          <tr>
            <td colSpan={2}>
              <select name="open_type" defaultValue={data.open_type} onChange={(e) => changeOpenType(e.target.value)}>
                {
                  Object.keys(data.config.open_types).map((key:string) => (
                    <option value={key} key={key}>{data.config.open_types[key].TypeName + "(" + data.config.open_types[key].OpenTime + "-" + data.config.open_types[key].CloseTime + ")"}</option>
                  ))
                }
              </select>
            </td>
          </tr>
          <tr>
            <td>児</td>
            <td className="p-0"><input className="text-right input-default" name="children" type="number" defaultValue={data.children.sum}/></td>
          </tr>
          <tr>
            <td>障</td>
            <td className="p-0"><input className="text-right input-default" name="disability" type="number" defaultValue={data.children.disability}/></td>
          </tr>
          <tr>
            <td>医</td>
            <td className="p-0"><input className="text-right input-default" name="medical_care" type="number" defaultValue={data.children.medical_care}/></td>
          </tr>
        </tbody>
      </table>

      <table className="table table-bordered text-center mt-3 w-full">
        <thead>
          <tr>
            <td>氏名</td>
            <td className="hidden sm:table-cell">指</td>
            <td className="hidden sm:table-cell">加</td>
            <td className="hidden sm:table-cell">医</td>
            <td>開始</td>
            <td>終了</td>
            <td>時間</td>
          </tr>
        </thead>
        <tbody>
          {
            instructors.map((inst: any) => (
              <tr key={inst.id}>
                <td className="text-base table-cell sm:hidden">{inst.name.slice(0,2)}</td>
                <td className="text-base hidden sm:table-cell">{inst.name}</td>
                <td className="hidden sm:table-cell">{(inst.qualification) ? '〇' : ''}</td>
                <td className="hidden sm:table-cell">{(inst.additional) ? '〇' : ''}</td>
                <td className="hidden sm:table-cell">{(inst.medical_care) ? '〇' : ''}</td>
                <td><input name={"times." + inst.id + ".start"} defaultValue={inst.start} type="time" min={"06:00:00"} max={"22:00:00"} step={"900"} onChange={(e) => setHour(e.target)} onBlur={() => setInstChk(checkInstructor(instData, data.config.open_types[data.open_type]))}/></td>
                <td><input name={"times." + inst.id + ".end"} defaultValue={inst.end} type="time" min={"06:00:00"} max={"22:00:00"} step={"900"} onChange={(e) => setHour(e.target)} onBlur={() => setInstChk(checkInstructor(instData, data.config.open_types[data.open_type]))}/></td>
                <td><input name={"times." + inst.id + ".hour"} defaultValue={instData[inst.id].hours} type="hidden" />{instData[inst.id].hours}</td>
              </tr>
            ))
          }
          <tr>
            <td>合計</td>
            <td colSpan={2} className="table-cell sm:hidden"></td>
            <td colSpan={5} className="hidden sm:table-cell"></td>
            <td><input name={"hour_summary"} defaultValue={sumHours} type="hidden" />{sumHours}</td>
          </tr>
        </tbody>
      </table>
      <p className="text-end mt-2">
        <button type="submit" className="btn-primary mr-3">登録</button>
        <button onClick={() => CancelClick()} type="button" className="btn btn-danger sm:mr-10">戻る</button>
      </p>
      <input type='hidden' name="school_id" value={params.school_id} />
      <input type='hidden' name="date" value={params.dt} />
    </Form>
  )
}