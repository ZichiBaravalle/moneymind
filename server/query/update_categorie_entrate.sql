UPDATE categorie c
left join entrate e on c.nome = e.categoria and c.utente = e.utente
left join uscite u on c.nome = u.categoria and c.utente = u.utente
set c.nome = :nomeNuovo,
    u.categoria = :nomeNuovo,
    e.categoria = :nomeNuovo,
    c.servizioCollegato = :servizioCollegato
where c.id = :id

