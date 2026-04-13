use sysinfo::Networks;

pub fn get_network_stats(networks: &Networks) -> (u64, u64) {
    let mut total_download: u64 = 0;
    let mut total_upload: u64 = 0;

    for (_name, network) in networks.iter() {
        total_download += network.total_received();
        total_upload += network.total_transmitted();
    }

    (total_download, total_upload)
}

pub fn get_interface_stats(networks: &Networks) -> Vec<(String, u64, u64)> {
    let mut interfaces: Vec<(String, u64, u64)> = Vec::new();

    for (name, network) in networks.iter() {
        interfaces.push((
            name.clone(),
            network.total_received(),
            network.total_transmitted(),
        ));
    }

    interfaces
}

pub fn is_online(networks: &Networks) -> bool {
    // If we see any traffic on any interface, we consider it online
    // This is a simple heuristic for the tray status
    networks.iter().any(|(_name, network)| {
        network.received() > 0 || network.transmitted() > 0
    })
}
