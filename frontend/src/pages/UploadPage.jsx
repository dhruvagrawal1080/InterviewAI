import React from 'react'
import UploadBox from '../components/UploadBox'

const UploadPage = () => {
    return (
        <div className='mt-20 h-[calc(100vh-5rem)] flex items-center bg-[#101828]'>
            <div className='w-9/10 mx-auto h-[35rem]'>
                <UploadBox />
            </div>
        </div>
    )
}

export default UploadPage