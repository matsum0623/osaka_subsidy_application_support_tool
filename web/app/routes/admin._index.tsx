import {
  useLoaderData,
  redirect,
  useNavigate,
  Form,
} from "@remix-run/react";
import { getIdToken } from "~/api/auth";
import { getData, postData } from "~/api/fetchApi";

export const clientLoader = async () => {
  const idToken = await getIdToken();
  if (!idToken){
    return redirect(`/`)
  }else{
    const data = await getData("/user", idToken)
    data.idToken = idToken
    data.after_schools = await getData("/after_school", idToken)
    data.users = await getData("/users", idToken)
    return data
  }
};

export default function Index() {
  const data = useLoaderData<typeof clientLoader>()
  if (!data.idToken){
    redirect("/");
  }

  const navigate = useNavigate()

  const AddAfterSchool = () => {
    console.log("学童追加")
  }

  const EditAfterSchool = (school_id:string) => {
    navigate(`./after_school/${school_id}`)
  }

  const modal_type:string = 'add'
  const user_id:string = ''
  const user_name:string = ''

  const handleSubmit = async (e:any) => {
    e.preventDefault()
    const form_data = new FormData(e.target)
    const after_schools:string[] = []
    const post_data = {
      user_id: form_data.get('user_id')?.toString(),
      user_name: form_data.get('user_name')?.toString(),
      after_schools: after_schools,
      admin_flag: false,
    }
    form_data.forEach((value, key) => {
      if(key.startsWith('after_school_check_')){
        post_data.after_schools.push(value.toString())
      }
    })
    // TODO:モーダルを無理やり閉じてる
    document.getElementById('add_modal_cancel')?.click()
    const response = await postData(`/user`, post_data, data.idToken)
    navigate('./')
  }

  const EditUser = async (user_id:string) => {}
  const DeleteUser = async (user_id:string) => {}

  return (
    <div>
      <div className="row">
        <div className="col-sm-2">
          <p className="h3">学童一覧</p>
        </div>
        <div className="col-sm-2">
          <button className="btn btn-primary" onClick={AddAfterSchool}>学童追加</button>
        </div>
      </div>
      <table className="table table-bordered text-center mt-3">
        <thead>
          <tr>
            <td>学童ID</td>
            <td>学童名</td>
            <td>児童数</td>
            <td>指導員数</td>
            <td></td>
          </tr>
        </thead>
        <tbody>
          {data.after_schools.list.map((afs:any) => (
            <tr key={afs.school_id}>
              <td className="align-middle">{afs.school_id}</td>
              <td className="align-middle">{afs.school_name}</td>
              <td className="align-middle">{afs.child_count}</td>
              <td className="align-middle">{afs.instructor_count}</td>
              <td><button className="btn btn-primary" onClick={() => EditAfterSchool(afs.school_id)}>編集</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="row">
        <div className="col-sm-2">
          <p className="h3">ユーザ一覧</p>
        </div>
        <div className="col-sm-2">
          <button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#add_modal">ユーザ追加</button>
        </div>
      </div>
      <table className="table table-bordered text-center mt-3">
        <thead>
          <tr>
            <td>ユーザID(メールアドレス)</td>
            <td>ユーザ名</td>
            <td>管理学童数</td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
        </thead>
        <tbody>
          {data.users.list.map((user:any) => (
            <tr key={user.user_id}>
              <td className="align-middle">{user.user_id}</td>
              <td className="align-middle">{user.user_name}</td>
              <td className="align-middle">{user.after_schools.length}</td>
              <td className="align-middle">{(user.status == 'active') ? '有効' : '無効'}</td>
              <td><button className="btn btn-primary" onClick={() => EditUser(user.user_id)}>編集</button></td>
              <td><button className="btn btn-danger" onClick={() => DeleteUser(user.user_id)}>削除</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      {/** ユーザ追加ダイアログ */}
      <Form onSubmit={(e) => handleSubmit(e)}>
        <div className="modal" id="add_modal" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">ユーザ追加</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="UserIdInput" className="form-label">ユーザID(メールアドレス)</label>
                  <input type="email" name="user_id" className="form-control" id="UserIdInput" placeholder="ユーザID" required/>
                </div>
                <div className="mb-3">
                  <label htmlFor="UserNameInput" className="form-label">ユーザ名</label>
                  <input type="text" name="user_name" className="form-control" id="UserNameInput" placeholder="ユーザ名" required/>
                </div>
                <div className="mb-3">
                  <label htmlFor="AfterSchoolSelect" className="form-label">管理学童</label>
                  <div id="AfterSchoolSelect">
                    {data.after_schools.list.map((afs:any) => (
                      <div className="form-check ml-1" key={afs.school_id}>
                        <input className="form-check-input" type="checkbox" name={`after_school_check_${afs.school_id}`} value={afs.school_id} id={`check_${afs.school_id}`}/>
                        <label className="form-check-label" htmlFor={`check_${afs.school_id}`}>{`${afs.school_id}:${afs.school_name}`}</label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" id="add_modal_cancel">キャンセル</button>
                <button type="submit" className="btn btn-primary" data-dismiss="modal" onClick={(e) => console.log(e)}>登録</button>
              </div>
            </div>
          </div>
        </div>
      </Form>

    </div>
  );
}
