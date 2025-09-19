// components/PedidoList.js

function PedidoItem({ p, onVerResultado }) {
  const fechaFmt = p.fecha
    ? new Date(p.fecha).toLocaleString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : '';

  const estadoClass =
    p.estado === 'ENTREGADO' ? 'badge-verde'
    : p.estado === 'EN_CURSO' ? 'badge-azul'
    : 'badge-gris';

  const resultadoClass =
    p.resultado === 'APROBADO' ? 'badge-verde'
    : p.resultado === 'OBSERVADO' ? 'badge-amarillo'
    : 'badge-gris';

  return (
    <div className="pedido">
      <div className="pedido-info">
        <strong>{(p.nombre || '').toUpperCase()} / {p.pedido_id}</strong>
        <div className="pedido-sub">
          {p.dominio ? <span className="pill">{p.dominio}</span> : null}
          {p.email ? <span className="sep">{p.email}</span> : null}
          {fechaFmt ? <span className="sep">{fechaFmt}</span> : null}
        </div>
      </div>

      <div className="badges">
        {p.estado && <span className={`badge ${estadoClass}`}>{p.estado.replace('_',' ')}</span>}
        {p.resultado && <span className={`badge ${resultadoClass}`}>{p.resultado}</span>}

        <button
          className="badge badge-link"
          onClick={() => onVerResultado?.(p)}
          type="button"
        >
          VER RESULTADO
        </button>
      </div>
    </div>
  );
}

export default function PedidoList({ pedidos, onVerResultado }) {
  if (!pedidos || pedidos.length === 0) {
    return <p className="no-encontrado">No se encontraron pedidos</p>;
  }

  return (
    <div className="pedido-lista">
      {pedidos.map((p) => (
        <PedidoItem
          key={p.id || `${p.pedido_id}-${p.dominio}`}
          p={p}
          onVerResultado={onVerResultado}
        />
      ))}
    </div>
  );
}
