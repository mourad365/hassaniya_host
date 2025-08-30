import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { Play, Eye } from 'lucide-react';
import ContentManagement from '@/components/admin/ContentManagement';
import ProgramForm from '@/components/admin/ProgramForm';

const ProgramManagementPage = () => {
  const { t } = useTranslation();

  const columns = [
    { key: 'title', label: 'العنوان', type: 'excerpt' },
    { key: 'program_type', label: 'نوع البرنامج', type: 'text' },
    { key: 'episode_number', label: 'رقم الحلقة', type: 'text' },
    { key: 'host_name', label: 'المقدم', type: 'text' },
    { key: 'duration', label: 'المدة', type: 'text' },
    { key: 'video_url', label: 'الفيديو', type: 'media' },
    { key: 'air_date', label: 'تاريخ البث', type: 'date' },
    { key: 'status', label: 'الحالة', type: 'status' },
  ];

  const additionalActions = [
    {
      icon: <Play size={16} />,
      onClick: (item) => {
        if (item.video_url) {
          window.open(item.video_url, '_blank');
        }
      },
      className: "text-blue-600 hover:text-blue-800"
    }
  ];

  return (
    <>
      <Helmet>
        <title>إدارة البرامج - {t('siteName')}</title>
      </Helmet>
      <ContentManagement
        contentType="program"
        tableName="programs"
        title="إدارة البرامج"
        FormComponent={ProgramForm}
        columns={columns}
        additionalActions={additionalActions}
      />
    </>
  );
};

export default ProgramManagementPage;
