import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
    roomId : string | null;
    connected: boolean;
    creater : boolean;
}

const initialState: UserState = {
  roomId: null,
  connected: false,
  creater : false,
}


const globalReducer = createSlice({
    name :"globalReducer",
    initialState,
    reducers:{
        setRoomId:(state,action:PayloadAction<string>)=>{
            state.roomId = action.payload;
        },
        setConnected:(state,action:PayloadAction<boolean>)=>{
            state.connected = action.payload;
        },
        setCreater:(state,action:PayloadAction<boolean>)=>{
            state.creater = action.payload;
        },
        resetState:()=>{
            return initialState;
        }
    }
})


export const {setRoomId,setConnected,resetState,setCreater} = globalReducer.actions;
export default globalReducer.reducer;