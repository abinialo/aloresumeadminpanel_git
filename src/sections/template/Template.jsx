import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, Pencil } from 'lucide-react'
import { useGetTemplatesQuery } from '../../hooks/useTemplateMutations'

const Template = () => {
  const navigate = useNavigate()
  const [page, setPage] = useState(0)
  const [limit, setLimit] = useState(10)

  const { data, isLoading, isError, error, isFetching } = useGetTemplatesQuery({ page, limit })

  const addtemplate = () => {
    navigate('/template/add')
  }

  const handleTemplateClick = (slugId) => {
    if (!slugId) return
    navigate(`/template/add?slugId=${encodeURIComponent(slugId)}`)
  }

  const payload = data?.data || {}
  const templates = Array.isArray(payload?.templates)
    ? payload.templates
    : Array.isArray(data)
      ? data
      : []

  const totalCount = payload?.totalCount ?? templates.length
  const fetchedCount = payload?.fetchedCount ?? templates.length
  const totalPages = Math.max(1, Math.ceil(totalCount / limit))

  const pageStart = useMemo(() => {
    if (totalCount === 0) return 0
    return page * limit + 1
  }, [page, limit, totalCount])

  const pageEnd = useMemo(() => {
    if (totalCount === 0) return 0
    return Math.min((page + 1) * limit, totalCount)
  }, [page, limit, totalCount])

  const handlePrev = () => setPage((prev) => Math.max(0, prev - 1))
  const handleNext = () => setPage((prev) => Math.min(totalPages - 1, prev + 1))

  const handleLimitChange = (e) => {
    const nextLimit = Number(e.target.value)
    setLimit(nextLimit)
    setPage(0)
  }

  return (
    <>
      <div className='flex items-center justify-between p-4'>
        <button className='border border-2 cursor-pointer px-3 py-1 rounded' onClick={addtemplate}>Add Template</button>

        <div className='flex items-center gap-2'>
          <label htmlFor='template-limit' className='text-sm text-gray-600'>Rows:</label>
          <select
            id='template-limit'
            value={limit}
            onChange={handleLimitChange}
            className='border rounded px-2 py-1 text-sm'
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {isLoading && <p className='p-8'>Loading templates...</p>}

      {isError && (
        <p className='p-8 text-red-600'>
          Failed to load templates: {error?.message || 'Unknown error'}
        </p>
      )}

      {!isLoading && !isError && (
        <div className='p-8 pt-0'>
          <div className='mb-4 flex items-center justify-between'>
            <p className='text-sm text-gray-600'>
              Total: {totalCount} | Fetched: {fetchedCount} | Showing {pageStart}-{pageEnd}
            </p>
            {isFetching && <p className='text-xs text-gray-500'>Updating...</p>}
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4'>
            {templates.length === 0 && (
              <p className='col-span-full text-gray-500'>No templates found.</p>
            )}

            {templates.map((template) => (
              <div
                key={template._id || template.id}
                className='group border rounded p-3 bg-white text-left hover:shadow'
              >
                <div className='relative mb-2 h-[250px] overflow-hidden rounded'>
                  <img src={template.thumbnail} alt={template.name || 'Template'} className='h-full w-full object-cover' />
                  <div className='pointer-events-none absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity duration-200 group-hover:opacity-100'>
                    <div className='rounded-full bg-white/95 p-2'>
                      <Eye className='w-5 h-5 text-gray-800' />
                    </div>
                  </div>
                </div>
                <div className='flex items-center justify-between'>
                  <p className='font-semibold'>{template.name || 'Untitled Template'}</p>
                  <button
                    type='button'
                    onClick={() => handleTemplateClick(template.slugId)}
                    className='p-1 rounded hover:bg-gray-100'
                    title='Edit template'
                  >
                    <Pencil className='w-4 h-4 text-gray-700' />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className='mt-6 flex items-center justify-end gap-2'>
            <button
              onClick={handlePrev}
              disabled={page === 0}
              className='border rounded px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              Prev
            </button>
            <span className='text-sm px-2'>Page {page + 1} of {totalPages}</span>
            <button
              onClick={handleNext}
              disabled={page >= totalPages - 1}
              className='border rounded px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              Next
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default Template
