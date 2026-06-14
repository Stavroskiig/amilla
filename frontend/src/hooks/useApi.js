import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_URL = import.meta.env.VITE_API_URL || '';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export const useProfileStats = (userId) => {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      const headers = getAuthHeaders();
      const [predRes, matchRes, ltRes, historyRes] = await Promise.all([
        fetch(API_URL + '/api/predictions/my', { headers }),
        fetch(API_URL + '/api/matches', { headers }),
        fetch(API_URL + '/api/predictions/longterm', { headers }),
        fetch(`${API_URL}/api/leaderboard/history/user/${userId}`, { headers })
      ]);

      const predictions = predRes.ok ? await predRes.json().catch(() => []) : [];
      const matches = matchRes.ok ? await matchRes.json().catch(() => []) : [];
      const longTermPred = ltRes.ok ? await ltRes.json().catch(() => null) : null;
      const rankHistory = historyRes.ok ? await historyRes.json().catch(() => []) : [];

      return { predictions, matches, longTermPred, rankHistory };
    },
    enabled: !!userId,
  });
};

export const useMatches = () => {
  return useQuery({
    queryKey: ['matches'],
    queryFn: async () => {
      const res = await fetch(API_URL + '/api/matches', { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Σφάλμα φόρτωσης αγώνων');
      return res.json();
    }
  });
};

export const useMyPredictions = () => {
  return useQuery({
    queryKey: ['myPredictions'],
    queryFn: async () => {
      const res = await fetch(API_URL + '/api/predictions/my', { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Σφάλμα φόρτωσης προβλέψεων');
      const predsList = await res.json();
      const predsData = {};
      predsList.forEach(pred => {
        predsData[pred.matchId] = {
          home: pred.predictedHomeScore,
          away: pred.predictedAwayScore,
          qualifier: pred.predictedQualifier || '',
          savedHome: pred.predictedHomeScore,
          savedAway: pred.predictedAwayScore,
          savedQualifier: pred.predictedQualifier || '',
          pointsEarned: pred.pointsEarned
        };
      });
      return predsData;
    }
  });
};

export const useSubmitMatchPrediction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ matchId, home, away, qualifier }) => {
      const res = await fetch(API_URL + '/api/predictions/match', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          matchId,
          predictedHomeScore: home,
          predictedAwayScore: away,
          predictedQualifier: qualifier || null
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Σφάλμα υποβολής');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myPredictions'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    }
  });
};

export const useLongTermInfo = () => {
  return useQuery({
    queryKey: ['longTermInfo'],
    queryFn: async () => {
      const headers = getAuthHeaders();
      const [predRes, matchRes] = await Promise.all([
        fetch(API_URL + '/api/predictions/longterm', { headers }),
        fetch(API_URL + '/api/matches', { headers })
      ]);

      let pred = null;
      if (predRes.ok) {
        pred = await predRes.json().catch(() => null);
      }

      let matches = [];
      if (matchRes.ok) {
        matches = await matchRes.json();
      }

      return { pred, matches };
    }
  });
};

export const useAllLongTermPredictions = (enabled = true) => {
  return useQuery({
    queryKey: ['allLongTermPredictions'],
    queryFn: async () => {
      const res = await fetch(API_URL + '/api/predictions/longterm/all', { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Σφάλμα φόρτωσης προβλέψεων πρωταθλητή');
      return res.json();
    },
    enabled,
    retry: false
  });
};

export const useSubmitLongTermPrediction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ championTeam, predictedTopScorer }) => {
      const res = await fetch(API_URL + '/api/predictions/longterm', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ championTeam, predictedTopScorer })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Σφάλμα υποβολής');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['longTermInfo'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['topScorerGoals'] });
    }
  });
};

export const useUpdateAvatar = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ avatar }) => {
      const res = await fetch(API_URL + '/api/auth/avatar', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ avatar })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Σφάλμα ενημέρωσης avatar');
      return data;
    },
    onSuccess: () => {
      // Optional invalidate if there's a user query, but user state is mostly kept in App.jsx
    }
  });
};

export const useTopScorerGoals = (enabled = true) => {
  return useQuery({
    queryKey: ['topScorerGoals'],
    queryFn: async () => {
      const res = await fetch(API_URL + '/api/predictions/longterm/topscorer-goals', { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Σφάλμα φόρτωσης γκολ πρώτων σκόρερ');
      return res.json();
    },
    enabled,
    retry: false
  });
};

export const useUpdatePlayerGoals = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ playerName, goals }) => {
      const res = await fetch(`${API_URL}/api/admin/longterm/topscorer-goals?playerName=${encodeURIComponent(playerName)}&goals=${goals}`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error('Σφάλμα ενημέρωσης γκολ');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topScorerGoals'] });
    }
  });
};

export const useResolveTournament = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ championTeam, topScorer }) => {
      let url = `${API_URL}/api/admin/longterm/resolve?`;
      const params = new URLSearchParams();
      if (championTeam) params.append('championTeam', championTeam);
      if (topScorer) params.append('topScorer', topScorer);
      const res = await fetch(url + params.toString(), {
        method: 'POST',
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error('Σφάλμα ολοκλήρωσης τουρνουά');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allMatches'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    }
  });
};
