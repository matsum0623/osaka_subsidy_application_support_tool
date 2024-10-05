import {
  useLoaderData,
  redirect,
  ClientLoaderFunctionArgs,
  useNavigate,
  Form,
  ClientActionFunctionArgs,
} from "@remix-run/react";
import { useState } from "react";
import { getIdToken } from "~/api/auth";
import { getData, postData, putData } from "~/api/fetchApi";

export const clientLoader = async ({
  params,
}: ClientLoaderFunctionArgs) => {
  // データを取ってくる
  const idToken = await getIdToken();
  if (!idToken){
    return redirect(`/`)
  }else{
    try {
      const data = await getData(`/after_school/${params.school_id}`, idToken)
      data.idToken = idToken
      return data
    } catch (error) {
      return redirect(`/`)
    }
  }
};

export const clientAction = async({
  request,
  params,
}: ClientActionFunctionArgs) => {
  const idToken = await getIdToken();
  if (!idToken){
    return redirect(`/`)
  }
  if(params.school_id == 'new'){
    const res = await postData(`/after_school`, Object.fromEntries(await request.formData()), idToken)
  }else{
    const res = await putData(`/after_school/${params.school_id}`, Object.fromEntries(await request.formData()), idToken)
  }
  return redirect(`/admin/after_school/${params.school_id}`)
}

export default function Index() {
  const data = useLoaderData<typeof clientLoader>()
  if (!data.idToken){
    redirect("/");
  }
  const navigate = useNavigate()

  const Cancel = () => {
    console.log('cancel')
    return navigate('/admin')
  }
  const EditInstructors = (school_id:string) => {
    return navigate(`../instructors/${school_id}`)
  }

  const [c6, setC6] = useState(data.children.c6)
  const [c5, setC5] = useState(data.children.c5)
  const [c4, setC4] = useState(data.children.c4)
  const [c3, setC3] = useState(data.children.c3)
  const [c2, setC2] = useState(data.children.c2)
  const [c1, setC1] = useState(data.children.c1)
  const [c_sum, setCSum] = useState(parseInt(c6) + parseInt(c5) + parseInt(c4) + parseInt(c3) + parseInt(c2) + parseInt(c1))

  const [c6_avg, setC6Avg] = useState(Math.ceil(6 * c6 / 6))
  const [c5_avg, setC5Avg] = useState(Math.ceil(5 * c5 / 6))
  const [c4_avg, setC4Avg] = useState(Math.ceil(4 * c4 / 6))
  const [c3_avg, setC3Avg] = useState(Math.ceil(3 * c3 / 6))
  const [c2_avg, setC2Avg] = useState(Math.ceil(2 * c2 / 6))
  const [c1_avg, setC1Avg] = useState(Math.ceil(1 * c1 / 6))
  const [c_avg_sum, setCAvgSum] = useState(c6_avg + c5_avg + c4_avg + c3_avg + c2_avg + c1_avg)

  const setAvg = (d:number, target:any) => {
    const week_num:number = 6
    const num:number = target.value == '' ? 0 : parseInt(target.value)
    const avg = Math.ceil(d * num / week_num)
    const sum_list = [c6, c5, c4, c3, c2, c1]
    const avg_list = [c6_avg, c5_avg, c4_avg, c3_avg, c2_avg, c1_avg]
    switch (d) {
      case 6:
        setC6(num)
        setC6Avg(avg)
        break;
      case 5:
        setC5(num)
        setC5Avg(avg)
        break;
      case 4:
        setC4(num)
        setC4Avg(avg)
        break;
      case 3:
        setC3(num)
        setC3Avg(avg)
        break;
      case 2:
        setC2(num)
        setC2Avg(avg)
        break;
      case 1:
        setC1(num)
        setC1Avg(avg)
        break;
      default:
        break;
    }
    sum_list[week_num-d] = num
    avg_list[week_num-d] = avg
    setCSum(sum_list.reduce((sum, item) => parseInt(sum) + parseInt(item), 0))
    setCAvgSum(avg_list.reduce((sum, item) => sum + item, 0))
  }

  return (
    <div>
      <Form method="post">
        <div className="row mt-2">
          <div className="col">
            <p className="h3">学童情報修正</p>
          </div>
          <div className="col"></div>
        </div>
        <div className="mt-3 pl-10 pr-10">
          <div className="mb-3">
            <label htmlFor="AfterSchoolId" className="form-label mb-3">学童ID</label>
            <input type="text" className="form-control mb-3" name="after_school_id" id="AfterSchoolId" defaultValue={data.school_id} readOnly={data.school_id != ''}/>
          </div>
          <div className="mb-3">
            <label htmlFor="AfterSchoolName" className="form-label mb-3">学童名称</label>
            <input type="text" className="form-control mb-3" name="after_school_name" id="AfterSchoolName" defaultValue={data.school_name} />
          </div>
          <div className="mb-3">
            <label htmlFor="ChildrenCount" className="form-label mb-3">児童数</label>
            <table className="table table-bordered text-center">
              <thead>
                <tr>
                  <th>日数</th>
                  <th>6/6</th>
                  <th>5/6</th>
                  <th>4/6</th>
                  <th>3/6</th>
                  <th>2/6</th>
                  <th>1/6</th>
                  <th>合計</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="col-2 align-middle">登録自動数</td>
                  <td className="col-1">
                    <input type="number" className="form-control text-center" name="children_6" defaultValue={data.children.c6} onChange={(e) => setAvg(6, e.target)}/>
                  </td>
                  <td className="col-1">
                    <input type="number" className="form-control text-center" name="children_5" defaultValue={data.children.c5} onChange={(e) => setAvg(5, e.target)}/>
                  </td>
                  <td className="col-1">
                    <input type="number" className="form-control text-center" name="children_4" defaultValue={data.children.c4} onChange={(e) => setAvg(4, e.target)}/>
                  </td>
                  <td className="col-1">
                    <input type="number" className="form-control text-center" name="children_3" defaultValue={data.children.c3} onChange={(e) => setAvg(3, e.target)}/>
                  </td>
                  <td className="col-1">
                    <input type="number" className="form-control text-center" name="children_2" defaultValue={data.children.c2} onChange={(e) => setAvg(2, e.target)}/>
                  </td>
                  <td className="col-1">
                    <input type="number" className="form-control text-center" name="children_1" defaultValue={data.children.c1} onChange={(e) => setAvg(1, e.target)}/>
                  </td>
                  <td className="col-2 align-middle">
                    {c_sum}
                  </td>
                </tr>
                <tr>
                  <td>平均登録自動数</td>
                  <td>{c6_avg}</td>
                  <td>{c5_avg}</td>
                  <td>{c4_avg}</td>
                  <td>{c3_avg}</td>
                  <td>{c2_avg}</td>
                  <td>{c1_avg}</td>
                  <td>{c_avg_sum}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mb-3">
            <label htmlFor="InstructorCount" className="form-label mb-3">指導員数</label>
            <button type="button" className="btn btn-primary ml-3" onClick={() => EditInstructors(data.school_id)}>指導員編集</button>
            <input type="text" className="form-control mb-3" id="InstructorCount" defaultValue={data.instructor_num} disabled/>
          </div>
          <div className="mb-3">
            <label htmlFor="ChildrenCount" className="form-label mb-3">開所タイプ</label>
            <table className="table table-bordered text-center">
              <thead>
                <tr>
                  <th>開所タイプ名称</th>
                  <th>開所時刻</th>
                  <th>閉所時刻</th>
                </tr>
              </thead>
              <tbody>
                {
                  Object.keys(data.open_types).map((key) => (
                    <tr key={key}>
                      <td>{data.open_types[key].type_name}</td>
                      <td>
                        <input type="time" defaultValue={data.open_types[key].open_time} name={"open_time_" + key + "_open"} className="border px-2 rounded"/>
                      </td>
                      <td>
                        <input type="time" defaultValue={data.open_types[key].close_time} name={"open_time_" + key + "_close"} className="border px-2 rounded"/>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
          <div className="col">
            <button type="submit" className="btn btn-primary ml-2 mr-2 mt-3">保存</button>
            <button type="button" className="btn btn-secondary mt-3" onClick={Cancel}>キャンセル</button>
          </div>
        </div>
      </Form>
    </div>
  );
}
