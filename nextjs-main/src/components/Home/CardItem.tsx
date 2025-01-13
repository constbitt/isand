import React from "react";
import Link from "next/link";
import Image from "next/image";
import {Card} from "@/src/store/types/homeTypes";

const CardItem = ({link, name, src, text}: Card) => {
    return (
        <Link href={link}>
            <div className="w-full h-full px-4 py-3 rounded-[32px] flex flex-col items-center shadow-[0_0_14px_rgba(0,0,0,0.25)]">
                <Image className="w-full" src={src} alt=""/>
                <h3 className="pt-6 pb-3 text-[32px] text-center font-bold text-blue-main whitespace-pre-line break-words" style={{lineHeight: 1.15}}>{name}</h3>
                <div className="h-full">
                    <p className="px-4 text-2xl font-normal whitespace-pre-line break-words" style={{lineHeight: 1.15}}>{text}</p>
                </div>
            </div>
        </Link>
    )
}

export default CardItem