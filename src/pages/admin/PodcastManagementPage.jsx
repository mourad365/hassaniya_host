import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { Play } from 'lucide-react';
import ContentManagement from '@/components/admin/ContentManagement';
import PodcastForm from '@/components/admin/PodcastForm';

const PodcastManagementPage = () => {
  const { t } = useTranslation();

  const columns = [
    { key: 'title', label: 'العنوان', type: 'excerpt' },
    { key: 'episode_number', label: 'رقم الحلقة', type: 'text' },
    { key: 'season', label: 'الموسم', type: 'text' },
    { key: 'host_name', label: 'المقدم', type: 'text' },
    { key: 'duration', label: 'المدة', type: 'text' },
    { key: 'audio_url', label: 'الصوت', type: 'media' },
    { key: 'publish_date', label: 'تاريخ النشر', type: 'date' },
    { key: 'status', label: 'الحالة', type: 'status' },
  ];

  const additionalActions = [
    {
      icon: <Play size={16} />,
      onClick: (item) => {
        if (item.audio_url) {
          window.open(item.audio_url, '_blank');
        }
      },
      className: "text-green-600 hover:text-green-800"
    }
  ];

  return (
    <>
      <Helmet>
        <title>إدارة البودكاست - {t('siteName')}</title>
      </Helmet>
      <ContentManagement
        contentType="podcast"
        tableName="podcasts"
        title="إدارة البودكاست"
        FormComponent={PodcastForm}
        columns={columns}
        additionalActions={additionalActions}
      />
    </>
  );
};

export default PodcastManagementPage;
