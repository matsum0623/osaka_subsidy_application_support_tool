import {
  Form,
  useNavigate,
  useLoaderData,
  ClientLoaderFunctionArgs,
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
  data.idToken = idToken
  return data;
};

export default function Edit() {
  const params:any = useParams()
  const navigate = useNavigate()
  const data = useLoaderData<typeof clientLoader>()

  const [instData, setInstData] = useState(data.instructors)
  const [sumHours, setSumHours] = useState(data.summary.hours)
  const [ct, setCt] = useState(0) // 再描画用のState
  const [instChk, setInstChk] = useState(checkInstructor(instData, data.config.open_types[data.open_type]).check) // 指導員の配置チェック
  const [excess_shortage, setExcessShortage] = useState<JSX.Element>(<div key="default">過不足はありません</div>)
  const [openType, setOpenType] = useState(data.open_type)
  const [childrenSum, setChildrenSum] = useState(data.children.sum)
  const [childrenDisability, setChildrenDisability] = useState(data.children.disability)
  const [childrenMedicalCare, setChildrenMedicalCare] = useState(data.children.medical_care)

  const setHour = (target:any) => {
    const [id, k] = target.name.split('.').slice(-2)
    const start_time = (k == 'start') ? target.value : instData[id].start
    const end_time = (k == 'end') ? target.value : instData[id].end
    if (!start_time || !end_time){
      instData[id].start = start_time
      instData[id].end = end_time
      instData[id].hours = ''
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
    setOpenType(value)
    setInstChk(checkInstructor(instData, data.config.open_types[value]).check)
  }
  const CancelClick = () => {
    navigate(`/monthly/${params.school_id}/${now_dt_state.toISOString().slice(0, 7)}`)
  }
  const changeAdditional = (id:string, checked:boolean) => {
    instData[id].additional_check = checked
    const check_response = checkInstructor(instData, data.config.open_types[openType])
    setInstChk(check_response.check)
    updateExcessShortage(check_response.excess_shortage)
    setInstData(instData)
    setCt(ct + 1)
  }
  const instructorCheck = () => {
    const check_response = checkInstructor(instData, data.config.open_types[openType])
    setInstChk(check_response.check)
    updateExcessShortage(check_response.excess_shortage)
  }
  const updateExcessShortage = (excess_shortage:any) => {
    console.log(excess_shortage)
    const excess:any[] = []
    const shortage:any[] = []
    console.log(excess_shortage)
    let pre_key:string = ''
    let pre_num:number = 0
    Object.keys(excess_shortage).sort().map((key:string) => {
      if(pre_key == ''){
        pre_key = key
        pre_num = excess_shortage[key].excess.num
      }else{

      }
    })
    return
    /*
    Object.keys(excess_shortage).map((key:string) => {
      if(excess_shortage[key].excess.num > 0){
        excess.push([key, excess_shortage[key].excess.num])
      }else if(excess_shortage[key].shortage.num > 0){
        shortage.push([key, excess_shortage[key].shortage.num])
      }
    })
    if(excess.length == 0 || shortage.length == 0){
      setExcessShortage(<div key="default">過不足はありません</div>)
      return
    }
    console.log(excess.length)
    const excess_html = (
      <div>
        {construct_html(excess, 'excess')}
      </div>
    )

    console.log(excess_html, shortage)
    setExcessShortage(excess_html)
    */
  }
  const construct_html = (data:any, type:string) => {
    for(value in data){
      console.log(value)
    }
    return data.map((value:any) => (
      <div key={value[0]}>{value[0]}:{value[1]}名</div>
    ))
  }
  const changeDate = (dt:string) => {
    getData(`/monthly/daily?date=${dt}&school_id=${params.school_id}`, data.idToken).then((res) => {
      const [now_dt, prev_dt, next_dt] = createDates(dt)
      setNowDtState(now_dt)
      setPrevDtState(prev_dt)
      setNextDtState(next_dt)
      setInstData(res.instructors)
      setChildrenSum(res.children.sum)
      setChildrenDisability(res.children.disability)
      setChildrenMedicalCare(res.children.medical_care)
      setSumHours(res.summary.hours)
      setCt(ct + 1)
    })
  }
  const createDates = (dt:string) => {
    const now_dt: Date = new Date(dt);
    const prev_dt: Date = new Date(dt);
    const next_dt: Date = new Date(dt);
    prev_dt.setDate(prev_dt.getDate() - 1);
    next_dt.setDate(next_dt.getDate() + 1);
    return [now_dt, prev_dt, next_dt]
  }

  const [now_dt, prev_dt, next_dt] = createDates(params.dt)
  const [now_dt_state, setNowDtState] = useState(now_dt)
  const [prev_dt_state, setPrevDtState] = useState(prev_dt)
  const [next_dt_state, setNextDtState] = useState(next_dt)
  const [modal_open, setModalOpen] = useState(false)
  const [go_next, setGoNext] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const post_data = {
      school_id: params.school_id,
      date: now_dt_state.toISOString().slice(0, 10),
      open_type: openType,
      instructors: instData,
      children: {
          sum: childrenSum,
          disability: childrenDisability,
          medical_care: childrenMedicalCare,
      },
      summary: {
          hours: sumHours,
      },
    }
    await postData("/monthly/daily", post_data, data.idToken)
    if(go_next){
      changeDate(next_dt_state.toISOString().slice(0, 10))
    }
  }

  return (
    <div>
      <div className="bg-white flex justify-between border-t-2 sticky top-12 sm:top-20 pt-2">
        <div className="text-base sm:text-2xl flex gap-3 justify-center sm:justify-start">
          <div>{now_dt_state.toISOString().slice(0, 10)}({weekday[now_dt_state.getDay()]})</div>
          <span className={(instChk ? 'text-green-500' : 'text-red-500 font-bold')}>{instChk ? "OK" : "NG"}</span>
            <button type="button" className="btn-primary" onClick={() => changeDate(prev_dt_state.toISOString().slice(0, 10))}>前日</button>
            <button type="button" className="btn-primary" onClick={() => changeDate(next_dt_state.toISOString().slice(0, 10))}>翌日</button>
          </div>
        <div className="text-base sm:text-2xl">
          <button type="button" className="btn-primary" onClick={() => setModalOpen(true)}>チェック</button>
        </div>
      </div>

      {/** 過不足確認ダイアログ */}
      <div id="excess-shortage-modal" tabIndex={-1} aria-hidden="true"
        className={(modal_open ? "block" : "hidden") + " modal-back-ground"}
        onClick={(e) => {
          if((e.target as HTMLElement).id == 'edit-modal'){
            setModalOpen(false)
          }
        }}>
        <div className="modal-dialog">
          <div className="modal-content">
              <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  指導員過不足確認
                </h3>
                <button type="button" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" onClick={() => setModalOpen(false)}>
                  <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                    <path stroke="currentColor" strokeLinecap={"round"} strokeLinejoin={"round"} strokeWidth={2} d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                  </svg>
                  <span className="sr-only">Close modal</span>
                </button>
              </div>
              <div className="modal-body">
              </div>
              <div className="modal-footer">
              </div>
          </div>
        </div>
      </div>


    <Form method="post" onSubmit={(e) => handleSubmit(e)}>
      <div className="sm:flex mt-3 w-full text-center">
        <div className="w-full border">
          <div className="hidden sm:block border-b font-bold p-1">開所パターン</div>
          <div>
            <select className="p-2" name="open_type" value={openType} onChange={(e) => changeOpenType(e.target.value)}>
              {
                Object.keys(data.config.open_types).map((key:string) => (
                  <option value={key} key={key}>{data.config.open_types[key].TypeName + "(" + data.config.open_types[key].OpenTime + "-" + data.config.open_types[key].CloseTime + ")"}</option>
                ))
              }
            </select>
          </div>
        </div>
        <div className="flex sm:block w-full border">
          <div className="w-1/4 sm:w-full border-b font-bold p-1">児童数</div>
          <div className="w-3/4 sm:w-full px-2"><input className="text-right input-default" name="children" type="number" value={childrenSum} onChange={(e) => setChildrenSum(e.target.value)}/></div>
        </div>
        <div className="flex sm:block w-full border">
          <div className="w-1/4 sm:w-full border-b font-bold p-1">障がい</div>
          <div className="w-3/4 sm:w-full px-2"><input className="text-right input-default" name="disability" type="number" value={childrenDisability} onChange={(e) => setChildrenDisability(e.target.value)}/></div>
        </div>
        <div className="flex sm:block w-full border">
          <div className="w-1/4 sm:w-full border-b font-bold p-1">医ケア</div>
          <div className="w-3/4 sm:w-full px-2"><input className="text-right input-default" name="medical_care" type="number" value={childrenMedicalCare} onChange={(e) => setChildrenMedicalCare(e.target.value)}/></div>
        </div>
      </div>

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
            <td>加配</td>
          </tr>
        </thead>
        <tbody>
          {
            Object.values(instData).sort((a:any, b:any) => (a.order - b.order)).map((inst: any) => {
              return (
              <tr key={inst.id}>
                <td className="text-base table-cell sm:hidden">{inst.name.slice(0,2)}</td>
                <td className="text-base hidden sm:table-cell">{inst.name}</td>
                <td className="hidden sm:table-cell">{(inst.qualification) ? '〇' : ''}</td>
                <td className="hidden sm:table-cell">{(inst.additional) ? '〇' : ''}</td>
                <td className="hidden sm:table-cell">{(inst.medical_care) ? '〇' : ''}</td>
                <td><input name={"times." + inst.id + ".start"} value={inst.start} type="time" min={"06:00:00"} max={"22:00:00"} step={"900"} onChange={(e) => setHour(e.target)} onBlur={() => instructorCheck()}/></td>
                <td><input name={"times." + inst.id + ".end"} value={inst.end} type="time" min={"06:00:00"} max={"22:00:00"} step={"900"} onChange={(e) => setHour(e.target)} onBlur={() => instructorCheck()}/></td>
                <td><input name={"times." + inst.id + ".hour"} value={inst.hours} type="hidden" />{inst.hours}</td>
                <td><input name={"additional." + inst.id} checked={inst.additional_check} type="checkbox" disabled={!inst.additional || inst.hours == ''} onChange={(e) => changeAdditional(inst.id, e.target.checked)}/></td>
              </tr>
            )})
          }
          <tr>
            <td>合計</td>
            <td colSpan={2} className="table-cell sm:hidden"></td>
            <td colSpan={5} className="hidden sm:table-cell"></td>
            <td><input name={"hour_summary"} defaultValue={sumHours} type="hidden" />{sumHours}</td>
            <td></td>
          </tr>
        </tbody>
      </table>
      <p className="text-end mt-2">
        <button type="submit" name='next' value={next_dt_state.toISOString().slice(0, 10)} className="btn-primary mr-3" onClick={() => setGoNext(true)}>登録</button>
        <button type="submit" className="btn-primary mr-3" onClick={() => setGoNext(false)}>登録</button>
        <button onClick={() => CancelClick()} type="button" className="btn btn-danger sm:mr-10">戻る</button>
      </p>
      <input type='hidden' name="school_id" value={params.school_id} />
      <input type='hidden' name="date" value={now_dt_state.toISOString().slice(0, 10)} />
    </Form>
    </div>
  )
}