import {Dialog, DialogContent, List} from "@mui/material";
import React, {ReactNode} from "react";
import ClosedDialogTitle from "@/src/components/Dialogs/ClosedDialogTitle";

const AuthorInfoDialog = ({open, setOpen, dataList, title}: {
    open: boolean,
    title: string | ReactNode,
    setOpen: (value: boolean) => void,
    dataList: { value: string, count: number }[]
}) => {


    return (
        <Dialog open={open} onClose={() => {
            setOpen(false)
        }}>
            <ClosedDialogTitle setOpen={setOpen}>
                {title}
            </ClosedDialogTitle>
            <DialogContent>
                <List>
                    {dataList.map((item, index) => {
                        return <div key={index}>&#x2022; {item.value} : {item.count}</div>
                    })}
                </List>
            </DialogContent>
        </Dialog>

    );


}

export default AuthorInfoDialog