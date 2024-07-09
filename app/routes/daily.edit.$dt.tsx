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
import { getData, postData } from "~/api/fetchApi";

export const clientLoader = async ({
  params,
}: ClientLoaderFunctionArgs) => {
  // データを取ってくる
  const data = await getData("/monthly/daily?date=" + params.dt)
  return data;
};

export const clientAction = async({
  request,
  params,
}: ClientActionFunctionArgs) => {
  await postData("/monthly/daily", Object.fromEntries(await request.formData()))
  return redirect(`/daily/edit/${params.dt}`);
}

export default function Edit() {
  const params = useParams()
  const navigate = useNavigate()
  const data = useLoaderData<typeof clientLoader>()
  const [instData, setInstData] = useState(data.instructors)
  const [sumHours, setSumHours] = useState(data.summary.hours)
  const [ct, setCt] = useState(0) // 再描画用のState

  const setHour = (target:string) => {
    const [id, k] = target.name.split('.').slice(-2)
    const start_time = (k == 'start') ? target.value : instData[id].start
    const end_time = (k == 'end') ? target.value : instData[id].end
    if (!start_time || !end_time){
      instData[id].start = start_time
      instData[id].end = end_time
    }else if (start_time >= end_time){
      console.log("エラー")
      console.log(start_time, end_time)
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
    Object.values(instData).map((inst:object) => {
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
    navigate("/monthly?ym=" + params.dt?.substring(0, 7))
  }

  const instructors = Object.values(data.instructors)
  return (
    <Form method="post">
      <p className="fs-2">
        {params.dt}
      </p>
      <h1 className="fs2">開所情報</h1>
      <table className="table table-bordered text-center">
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
            <td><input className="form-control text-right" name="children" type="number" defaultValue={data.children.sum}/></td>
            <td><input className="form-control text-right" name="disability" type="number" defaultValue={data.children.disability}/></td>
            <td><input className="form-control text-right" name="medical_care" type="number" defaultValue={data.children.medical_care}/></td>
          </tr>
        </tbody>
      </table>

      <h1 className="fs2">指導員情報</h1>
      <table className="table table-bordered text-center">
        <thead>
          <tr>
            <td>氏名</td>
            <td>開始</td>
            <td>終了</td>
            <td>時間</td>
          </tr>
        </thead>
        <tbody>
          {
            instructors.map((inst: any) => (
              <tr key={inst.id}>
                <td>{inst.name}</td>
                <td><input name={"times." + inst.id + ".start"} defaultValue={inst.start} type="time" min={"06:00:00"} max={"22:00:00"} step={"900"} onChange={(e) => setHour(e.target)}/></td>
                <td><input name={"times." + inst.id + ".end"} defaultValue={inst.end} type="time" min={"06:00:00"} max={"22:00:00"} step={"900"} onChange={(e) => setHour(e.target)}/></td>
                <td><input name={"times." + inst.id + ".hour"} defaultValue={instData[inst.id].hours} type="hidden" />{instData[inst.id].hours}</td>
              </tr>
            ))
          }
          <tr>
            <td>合計</td>
            <td></td>
            <td></td>
            <td><input name={"hour_summary"} defaultValue={sumHours} type="hidden" />{sumHours}</td>
          </tr>
        </tbody>
      </table>
      <p>
        <button type="submit" className="btn btn-primary">登録</button>
        <button onClick={() => CancelClick()} type="button" className="btn btn-danger">キャンセル</button>
      </p>
      <input type='hidden' name="date" value={params.dt} />
    </Form>
  )
}