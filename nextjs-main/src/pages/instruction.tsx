import Head from "next/head";
import React from "react";

const Instruction = () => {

    return (
        <>
            <Head>
                <title>Инструкция</title>
            </Head>
            <div style={{height: "70vh"}}>
                <embed src={"instruction.pdf"} type={"application/pdf"} width={"100%"} height={"100%"}/>
            </div>
        </>
    );
}

export default Instruction;