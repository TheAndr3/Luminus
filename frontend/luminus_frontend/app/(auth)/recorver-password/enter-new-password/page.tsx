'use client'
import Image from "next/image";
import logoimg from "@/app/Image/logoLuminus.svg";
import style from "./page.module.css";


import CheckSame from "./components/checkSame";

export default function EnterNewPassword() {
    return (
        <div className={style.container}>
            <div className={style.left_panel}>
                Painel esquerdo
            </div>

            <div className={style.right_panel}>
                <Image
                    src={logoimg}
                    alt="Logo da Luminus"
                    className={style.logo}
                />
                <CheckSame/>
            </div>
        </div>
    );
}