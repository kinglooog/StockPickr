import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { TopicBrief, TopicDetail, TopicListResponse, RefreshResponse } from '../api/client';
import { api } from '../api/client';

export function useTopicList(page = 1, pageSize = 20, date?: string) {
  return useQuery<TopicListResponse>({
    queryKey: ['topics', 'list', page, pageSize, date],
    queryFn: () => api.topics.list(page, pageSize, date),
    staleTime: 5 * 60 * 1000,
  });
}

export function useHotTopics(limit = 10) {
  return useQuery<TopicBrief[]>({
    queryKey: ['topics', 'hot', limit],
    queryFn: () => api.topics.hot(limit),
    staleTime: 5 * 60 * 1000,
  });
}

export function useTopicDetail(id: string) {
  return useQuery<TopicDetail>({
    queryKey: ['topics', 'detail', id],
    queryFn: () => api.topics.detail(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
}

export function useRefresh() {
  const queryClient = useQueryClient();

  return useMutation<RefreshResponse>({
    mutationFn: () => api.system.refresh(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics'] });
    },
  });
}

export function useAvailableDates() {
  return useQuery<string[]>({
    queryKey: ['dates'],
    queryFn: async () => {
      const data = await api.dates.list();
      return data.dates;
    },
    staleTime: 10 * 60 * 1000,
  });
}
