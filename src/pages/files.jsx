import { PageContainer } from '@ant-design/pro-components'
import React, { useEffect, useState } from 'react'
import FileUpload from '../components/FileUpload';


const Files = () => {


  return (
    <PageContainer title="settings">
<h1 className="text-2xl font-bold mb-6">File Upload</h1>
<FileUpload />
    </PageContainer>
  )
}

export default Files