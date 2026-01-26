<?php
// SVG-Cover-Generator mit 8 verschiedenen Design-Varianten
header('Content-Type: application/json; charset=UTF-8');

$baseDir = __DIR__;
$dataDir = $baseDir . DIRECTORY_SEPARATOR . 'data';
$tracksJson = $baseDir . DIRECTORY_SEPARATOR . 'tracks.json';
$coversDir = $baseDir . DIRECTORY_SEPARATOR . 'covers';

if (!is_dir($coversDir)) {
	if (!@mkdir($coversDir, 0775, true)) {
		echo json_encode(['success' => false, 'error' => 'Covers-Ordner konnte nicht erstellt werden']);
		exit;
	}
}

function svg_escape($s) {
	return htmlspecialchars($s, ENT_QUOTES, 'UTF-8');
}

function category_colors($cat) {
	$cat = strtolower($cat);
	if ($cat === 'party') return ['#06FFF0', '#8B5CF6'];
	if ($cat === 'rapp') return ['#FFD700', '#FF8C00'];
	if ($cat === 'love') return ['#FF006E', '#FF8C00'];
	if ($cat === 'gemischt') return ['#8B5CF6', '#06FFF0'];
	if ($cat === 'traurig') return ['#4A5568', '#718096'];
	return ['#8B5CF6', '#06FFF0'];
}

function simple_wrap($text, $maxLen = 18) {
	$text = trim($text);
	if ($text === '') return ['New Track'];
	if (strlen($text) <= $maxLen) return [$text];
	
	$words = explode(' ', $text);
	$lines = [];
	$line = '';
	foreach ($words as $w) {
		$test = $line === '' ? $w : $line . ' ' . $w;
		if (strlen($test) <= $maxLen) {
			$line = $test;
		} else {
			if ($line !== '') $lines[] = $line;
			$line = $w;
		}
	}
	if ($line !== '') $lines[] = $line;
	if (count($lines) > 3) $lines = array_slice($lines, 0, 3);
	return $lines;
}

function build_text_elements($lines, $startY, $fontSize, $c1, $c2) {
	$text = '';
	for ($i = 0; $i < count($lines); $i++) {
		$y = $startY + $i * ($fontSize + 10);
		$line = svg_escape($lines[$i]);
		$text .= '<text x="600" y="' . $y . '" text-anchor="middle" font-family="Arial,sans-serif" font-weight="900" font-size="' . $fontSize . '" fill="url(#g)" filter="url(#glow)">' . $line . '</text>';
	}
	return $text;
}

// 8 verschiedene Design-Varianten
function design_neon_waves($c1, $c2) {
	return '<g opacity="0.15">
		<path d="M0,300 Q300,200 600,300 T1200,300" stroke="' . $c1 . '" stroke-width="3" fill="none"/>
		<path d="M0,500 Q300,400 600,500 T1200,500" stroke="' . $c2 . '" stroke-width="3" fill="none"/>
		<path d="M0,700 Q300,600 600,700 T1200,700" stroke="' . $c1 . '" stroke-width="3" fill="none"/>
		<path d="M0,900 Q300,800 600,900 T1200,900" stroke="' . $c2 . '" stroke-width="3" fill="none"/>
	</g>
	<circle cx="200" cy="250" r="120" fill="' . $c1 . '" opacity="0.1" filter="url(#glow)"/>
	<circle cx="1000" cy="950" r="150" fill="' . $c2 . '" opacity="0.1" filter="url(#glow)"/>';
}

function design_geometric_burst($c1, $c2) {
	return '<g opacity="0.12" stroke="' . $c1 . '" stroke-width="2" fill="none">
		<polygon points="600,200 800,400 600,600 400,400"/>
		<polygon points="600,300 750,450 600,600 450,450"/>
		<polygon points="600,400 700,500 600,600 500,500"/>
	</g>
	<g opacity="0.12" stroke="' . $c2 . '" stroke-width="2" fill="none">
		<circle cx="600" cy="600" r="350"/>
		<circle cx="600" cy="600" r="280"/>
		<circle cx="600" cy="600" r="210"/>
	</g>
	<rect x="100" y="100" width="200" height="200" fill="url(#g)" opacity="0.08" transform="rotate(45 200 200)"/>';
}

function design_synthwave_grid($c1, $c2) {
	return '<defs>
		<linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0%" stop-color="' . $c1 . '" stop-opacity="0"/>
			<stop offset="100%" stop-color="' . $c2 . '" stop-opacity="0.3"/>
		</linearGradient>
	</defs>
	<rect x="0" y="700" width="1200" height="500" fill="url(#g2)"/>
	<g opacity="0.15" stroke="' . $c1 . '" stroke-width="2">
		<line x1="0" y1="700" x2="600" y2="1200"/>
		<line x1="200" y1="700" x2="600" y2="1100"/>
		<line x1="400" y1="700" x2="600" y2="1000"/>
		<line x1="600" y1="700" x2="600" y2="900"/>
		<line x1="800" y1="700" x2="600" y2="1000"/>
		<line x1="1000" y1="700" x2="600" y2="1100"/>
		<line x1="1200" y1="700" x2="600" y2="1200"/>
	</g>
	<circle cx="600" cy="250" r="180" fill="' . $c2 . '" opacity="0.15" filter="url(#glow)"/>';
}

function design_abstract_flow($c1, $c2) {
	return '<g opacity="0.12" fill="none" stroke-width="3">
		<path d="M100,200 Q300,100 500,200 T900,200 Q1000,300 1100,400" stroke="' . $c1 . '"/>
		<path d="M100,400 Q400,300 700,400 T1100,600" stroke="' . $c2 . '"/>
		<path d="M200,800 Q500,700 800,900 T1100,1000" stroke="' . $c1 . '"/>
	</g>
	<ellipse cx="300" cy="350" rx="200" ry="150" fill="url(#g)" opacity="0.1" transform="rotate(30 300 350)"/>
	<ellipse cx="900" cy="850" rx="180" ry="220" fill="url(#g)" opacity="0.1" transform="rotate(-20 900 850)"/>';
}

function design_particle_field($c1, $c2) {
	$particles = '<g opacity="0.3">';
	for ($i = 0; $i < 30; $i++) {
		$x = rand(100, 1100);
		$y = rand(100, 1100);
		$r = rand(3, 8);
		$color = $i % 2 === 0 ? $c1 : $c2;
		$particles .= '<circle cx="' . $x . '" cy="' . $y . '" r="' . $r . '" fill="' . $color . '"/>';
	}
	$particles .= '</g>';
	return $particles . '<circle cx="850" cy="300" r="200" fill="url(#g)" opacity="0.08"/>';
}

function design_gradient_rings($c1, $c2) {
	return '<g opacity="0.15" fill="none" stroke-width="4">
		<circle cx="600" cy="600" r="450" stroke="' . $c1 . '"/>
		<circle cx="600" cy="600" r="380" stroke="' . $c2 . '"/>
		<circle cx="600" cy="600" r="310" stroke="' . $c1 . '"/>
		<circle cx="600" cy="600" r="240" stroke="' . $c2 . '"/>
		<circle cx="600" cy="600" r="170" stroke="' . $c1 . '"/>
	</g>
	<polygon points="600,150 750,400 600,650 450,400" fill="url(#g)" opacity="0.1"/>';
}

function design_digital_rain($c1, $c2) {
	$rain = '<g opacity="0.2" stroke-width="2">';
	for ($i = 0; $i < 20; $i++) {
		$x = 100 + $i * 55;
		$height = rand(100, 400);
		$color = $i % 2 === 0 ? $c1 : $c2;
		$rain .= '<line x1="' . $x . '" y1="100" x2="' . $x . '" y2="' . (100 + $height) . '" stroke="' . $color . '"/>';
	}
	$rain .= '</g>';
	return $rain . '<rect x="400" y="400" width="400" height="400" fill="url(#g)" opacity="0.05" transform="rotate(45 600 600)"/>';
}

function design_cosmic_blend($c1, $c2) {
	return '<defs>
		<radialGradient id="cosmic1">
			<stop offset="0%" stop-color="' . $c1 . '" stop-opacity="0.3"/>
			<stop offset="100%" stop-color="transparent"/>
		</radialGradient>
		<radialGradient id="cosmic2">
			<stop offset="0%" stop-color="' . $c2 . '" stop-opacity="0.3"/>
			<stop offset="100%" stop-color="transparent"/>
		</radialGradient>
	</defs>
	<circle cx="300" cy="300" r="300" fill="url(#cosmic1)"/>
	<circle cx="900" cy="700" r="350" fill="url(#cosmic2)"/>
	<circle cx="700" cy="500" r="250" fill="url(#cosmic1)"/>
	<g opacity="0.1" stroke="' . $c1 . '" stroke-width="1" fill="none">
		<circle cx="600" cy="600" r="100"/>
		<circle cx="600" cy="600" r="200"/>
		<circle cx="600" cy="600" r="300"/>
	</g>';
}

function design_hexagon_grid($c1, $c2) {
	$hex = '<g opacity="0.12" stroke="' . $c1 . '" stroke-width="2" fill="none">';
	for ($row = 0; $row < 5; $row++) {
		for ($col = 0; $col < 5; $col++) {
			$x = 200 + $col * 180 + ($row % 2) * 90;
			$y = 200 + $row * 160;
			$hex .= '<polygon points="' . ($x-40) . ',' . $y . ' ' . ($x-20) . ',' . ($y-35) . ' ' . ($x+20) . ',' . ($y-35) . ' ' . ($x+40) . ',' . $y . ' ' . ($x+20) . ',' . ($y+35) . ' ' . ($x-20) . ',' . ($y+35) . '"/>';
		}
	}
	$hex .= '</g><circle cx="950" cy="300" r="150" fill="' . $c2 . '" opacity="0.15"/>';
	return $hex;
}

function design_spiral_vortex($c1, $c2) {
	$spiral = '<g opacity="0.15" fill="none" stroke-width="3">';
	for ($i = 0; $i < 8; $i++) {
		$angle = $i * 45;
		$r1 = 200 + $i * 30;
		$r2 = 250 + $i * 30;
		$color = $i % 2 === 0 ? $c1 : $c2;
		$spiral .= '<circle cx="600" cy="600" r="' . $r1 . '" stroke="' . $color . '"/>';
	}
	$spiral .= '</g><polygon points="600,200 700,400 600,600 500,400" fill="url(#g)" opacity="0.1" transform="rotate(45 600 400)"/>';
	return $spiral;
}

function design_wave_interference($c1, $c2) {
	$waves = '<g opacity="0.12" fill="none" stroke-width="2">';
	for ($i = 0; $i < 10; $i++) {
		$y = 100 + $i * 100;
		$color = $i % 2 === 0 ? $c1 : $c2;
		$waves .= '<path d="M0,' . $y . ' Q300,' . ($y-50) . ' 600,' . $y . ' T1200,' . $y . '" stroke="' . $color . '"/>';
	}
	$waves .= '</g><circle cx="250" cy="300" r="180" fill="' . $c1 . '" opacity="0.08" filter="url(#glow)"/>';
	return $waves;
}

function design_diamond_lattice($c1, $c2) {
	$lattice = '<g opacity="0.1" stroke="' . $c1 . '" stroke-width="2" fill="none">';
	for ($i = 0; $i < 6; $i++) {
		for ($j = 0; $j < 6; $j++) {
			$cx = 100 + $i * 200;
			$cy = 100 + $j * 200;
			$lattice .= '<rect x="' . ($cx-30) . '" y="' . ($cy-30) . '" width="60" height="60" transform="rotate(45 ' . $cx . ' ' . $cy . ')"/>';
		}
	}
	$lattice .= '</g><ellipse cx="800" cy="400" rx="200" ry="120" fill="' . $c2 . '" opacity="0.12" transform="rotate(30 800 400)"/>';
	return $lattice;
}

function design_starburst($c1, $c2) {
	$burst = '<g opacity="0.15" stroke-width="3">';
	for ($i = 0; $i < 24; $i++) {
		$angle = $i * 15;
		$rad = deg2rad($angle);
		$x1 = 600 + cos($rad) * 150;
		$y1 = 600 + sin($rad) * 150;
		$x2 = 600 + cos($rad) * 450;
		$y2 = 600 + sin($rad) * 450;
		$color = $i % 2 === 0 ? $c1 : $c2;
		$burst .= '<line x1="' . $x1 . '" y1="' . $y1 . '" x2="' . $x2 . '" y2="' . $y2 . '" stroke="' . $color . '"/>';
	}
	$burst .= '</g>';
	return $burst;
}

function design_triangle_mosaic($c1, $c2) {
	$mosaic = '<g opacity="0.1">';
	for ($i = 0; $i < 12; $i++) {
		$x = rand(100, 1000);
		$y = rand(100, 1000);
		$size = rand(80, 180);
		$color = $i % 3 === 0 ? $c1 : ($i % 3 === 1 ? $c2 : 'url(#g)');
		$mosaic .= '<polygon points="' . $x . ',' . $y . ' ' . ($x+$size) . ',' . $y . ' ' . ($x+$size/2) . ',' . ($y+$size) . '" fill="' . $color . '"/>';
	}
	$mosaic .= '</g>';
	return $mosaic;
}

function design_concentric_squares($c1, $c2) {
	$squares = '<g opacity="0.12" fill="none" stroke-width="3">';
	for ($i = 1; $i <= 7; $i++) {
		$size = $i * 120;
		$color = $i % 2 === 0 ? $c1 : $c2;
		$x = 600 - $size/2;
		$y = 600 - $size/2;
		$squares .= '<rect x="' . $x . '" y="' . $y . '" width="' . $size . '" height="' . $size . '" stroke="' . $color . '" transform="rotate(' . ($i*5) . ' 600 600)"/>';
	}
	$squares .= '</g>';
	return $squares;
}

function design_radial_burst($c1, $c2) {
	$radial = '<g opacity="0.15">';
	for ($i = 0; $i < 16; $i++) {
		$angle = $i * 22.5;
		$rad = deg2rad($angle);
		$x = 600 + cos($rad) * 500;
		$y = 600 + sin($rad) * 500;
		$color = $i % 2 === 0 ? $c1 : $c2;
		$radial .= '<circle cx="' . $x . '" cy="' . $y . '" r="' . rand(40, 80) . '" fill="' . $color . '" opacity="0.5"/>';
	}
	$radial .= '</g>';
	return $radial;
}

function design_sine_waves($c1, $c2) {
	$waves = '<g opacity="0.12" fill="none" stroke-width="2">';
	for ($i = 0; $i < 8; $i++) {
		$offset = $i * 150;
		$color = $i % 2 === 0 ? $c1 : $c2;
		$waves .= '<path d="M0,' . $offset . ' Q200,' . ($offset-100) . ' 400,' . $offset . ' T800,' . $offset . ' Q1000,' . ($offset+100) . ' 1200,' . $offset . '" stroke="' . $color . '"/>';
	}
	$waves .= '</g><rect x="400" y="400" width="400" height="400" fill="url(#g)" opacity="0.05" rx="50"/>';
	return $waves;
}

function design_orbit_rings($c1, $c2) {
	$rings = '<g opacity="0.12" fill="none" stroke-width="4">';
	for ($i = 1; $i <= 6; $i++) {
		$rx = 150 + $i * 60;
		$ry = 100 + $i * 40;
		$color = $i % 2 === 0 ? $c1 : $c2;
		$rings .= '<ellipse cx="600" cy="600" rx="' . $rx . '" ry="' . $ry . '" stroke="' . $color . '" transform="rotate(' . ($i*15) . ' 600 600)"/>';
	}
	$rings .= '</g>';
	return $rings;
}

function design_tech_grid($c1, $c2) {
	$grid = '<g opacity="0.08" stroke="' . $c1 . '" stroke-width="1">';
	for ($i = 0; $i <= 12; $i++) {
		$pos = $i * 100;
		$grid .= '<line x1="' . $pos . '" y1="0" x2="' . $pos . '" y2="1200"/>';
		$grid .= '<line x1="0" y1="' . $pos . '" x2="1200" y2="' . $pos . '"/>';
	}
	$grid .= '</g>';
	$grid .= '<circle cx="300" cy="300" r="200" fill="' . $c2 . '" opacity="0.15"/>';
	$grid .= '<circle cx="900" cy="900" r="180" fill="' . $c1 . '" opacity="0.15"/>';
	return $grid;
}

function design_slash_pattern($c1, $c2) {
	$slash = '<g opacity="0.1" stroke-width="4">';
	for ($i = 0; $i < 20; $i++) {
		$x = $i * 60;
		$color = $i % 2 === 0 ? $c1 : $c2;
		$slash .= '<line x1="' . $x . '" y1="0" x2="' . ($x+400) . '" y2="1200" stroke="' . $color . '"/>';
	}
	$slash .= '</g><circle cx="600" cy="600" r="250" fill="url(#g)" opacity="0.08"/>';
	return $slash;
}

function design_crosshatch($c1, $c2) {
	$cross = '<g opacity="0.1" stroke-width="2">';
	for ($i = 0; $i < 15; $i++) {
		$pos = 100 + $i * 80;
		$cross .= '<line x1="' . $pos . '" y1="0" x2="0" y2="' . $pos . '" stroke="' . $c1 . '"/>';
		$cross .= '<line x1="1200" y1="' . $pos . '" x2="' . $pos . '" y2="1200" stroke="' . $c2 . '"/>';
	}
	$cross .= '</g><polygon points="600,300 750,600 600,900 450,600" fill="url(#g)" opacity="0.12"/>';
	return $cross;
}

function design_bubble_cluster($c1, $c2) {
	$bubbles = '<g opacity="0.15">';
	$positions = [[300,300,150],[700,400,120],[500,700,180],[900,800,140],[200,900,100],[1000,500,130]];
	foreach ($positions as $idx => $pos) {
		$color = $idx % 2 === 0 ? $c1 : $c2;
		$bubbles .= '<circle cx="' . $pos[0] . '" cy="' . $pos[1] . '" r="' . $pos[2] . '" fill="' . $color . '" opacity="0.4"/>';
	}
	$bubbles .= '</g>';
	return $bubbles;
}

function design_zigzag_energy($c1, $c2) {
	$zigzag = '<g opacity="0.15" fill="none" stroke-width="4">';
	for ($i = 0; $i < 6; $i++) {
		$y = 200 + $i * 150;
		$color = $i % 2 === 0 ? $c1 : $c2;
		$zigzag .= '<path d="M0,' . $y . ' L200,' . ($y-80) . ' L400,' . $y . ' L600,' . ($y-80) . ' L800,' . $y . ' L1000,' . ($y-80) . ' L1200,' . $y . '" stroke="' . $color . '"/>';
	}
	$zigzag .= '</g>';
	return $zigzag;
}

function design_corner_accent($c1, $c2) {
	return '<polygon points="0,0 300,0 0,300" fill="' . $c1 . '" opacity="0.15"/>
	<polygon points="1200,0 900,0 1200,300" fill="' . $c2 . '" opacity="0.15"/>
	<polygon points="0,1200 300,1200 0,900" fill="' . $c2 . '" opacity="0.15"/>
	<polygon points="1200,1200 900,1200 1200,900" fill="' . $c1 . '" opacity="0.15"/>
	<circle cx="600" cy="600" r="350" fill="none" stroke="url(#g)" stroke-width="3" opacity="0.2"/>';
}

function design_diagonal_stripes($c1, $c2) {
	$stripes = '<g opacity="0.08">';
	for ($i = 0; $i < 30; $i++) {
		$x = -200 + $i * 80;
		$color = $i % 2 === 0 ? $c1 : $c2;
		$stripes .= '<rect x="' . $x . '" y="0" width="40" height="1400" fill="' . $color . '" transform="rotate(45 600 600)"/>';
	}
	$stripes .= '</g><circle cx="600" cy="600" r="200" fill="url(#g)" opacity="0.12"/>';
	return $stripes;
}

function design_pulse_circles($c1, $c2) {
	$pulse = '<g opacity="0.12" fill="none" stroke-width="3">';
	$centers = [[300,300],[900,300],[300,900],[900,900]];
	foreach ($centers as $idx => $center) {
		$color = $idx % 2 === 0 ? $c1 : $c2;
		for ($r = 50; $r <= 200; $r += 50) {
			$pulse .= '<circle cx="' . $center[0] . '" cy="' . $center[1] . '" r="' . $r . '" stroke="' . $color . '"/>';
		}
	}
	$pulse .= '</g>';
	return $pulse;
}

function design_fractal_tree($c1, $c2) {
	$tree = '<g opacity="0.12" stroke-width="2" fill="none">';
	$tree .= '<path d="M600,1000 L600,700 M600,700 L500,500 M600,700 L700,500 M500,500 L450,350 M500,500 L550,350 M700,500 L650,350 M700,500 L750,350" stroke="' . $c1 . '"/>';
	$tree .= '<circle cx="450" cy="350" r="40" fill="' . $c2 . '" opacity="0.5"/>';
	$tree .= '<circle cx="550" cy="350" r="40" fill="' . $c1 . '" opacity="0.5"/>';
	$tree .= '<circle cx="650" cy="350" r="40" fill="' . $c2 . '" opacity="0.5"/>';
	$tree .= '<circle cx="750" cy="350" r="40" fill="' . $c1 . '" opacity="0.5"/>';
	$tree .= '</g>';
	return $tree;
}

function design_sound_bars($c1, $c2) {
	$bars = '<g opacity="0.15">';
	for ($i = 0; $i < 20; $i++) {
		$x = 50 + $i * 60;
		$height = rand(100, 800);
		$y = 1100 - $height;
		$color = $i % 2 === 0 ? $c1 : $c2;
		$bars .= '<rect x="' . $x . '" y="' . $y . '" width="40" height="' . $height . '" fill="' . $color . '" rx="8"/>';
	}
	$bars .= '</g>';
	return $bars;
}

function design_pixel_grid($c1, $c2) {
	$pixels = '<g opacity="0.12">';
	for ($i = 0; $i < 80; $i++) {
		$x = rand(50, 1150);
		$y = rand(50, 1150);
		$size = rand(20, 60);
		$color = $i % 3 === 0 ? $c1 : ($i % 3 === 1 ? $c2 : 'url(#g)');
		$pixels .= '<rect x="' . $x . '" y="' . $y . '" width="' . $size . '" height="' . $size . '" fill="' . $color . '"/>';
	}
	$pixels .= '</g>';
	return $pixels;
}

function design_circuit_board($c1, $c2) {
	$circuit = '<g opacity="0.1" stroke-width="2">';
	$circuit .= '<path d="M200,200 H400 V400 H600 V200 H800 V600 H600 V800 H400 V600 H200 Z" stroke="' . $c1 . '" fill="none"/>';
	$circuit .= '<circle cx="200" cy="200" r="15" fill="' . $c2 . '"/>';
	$circuit .= '<circle cx="400" cy="400" r="15" fill="' . $c1 . '"/>';
	$circuit .= '<circle cx="600" cy="200" r="15" fill="' . $c2 . '"/>';
	$circuit .= '<circle cx="800" cy="600" r="15" fill="' . $c1 . '"/>';
	$circuit .= '<rect x="900" y="800" width="200" height="200" fill="url(#g)" opacity="0.3" rx="20"/>';
	$circuit .= '</g>';
	return $circuit;
}

function design_aurora_flow($c1, $c2) {
	return '<defs>
		<linearGradient id="aurora1" x1="0" y1="0" x2="1" y2="1">
			<stop offset="0%" stop-color="' . $c1 . '" stop-opacity="0.3"/>
			<stop offset="50%" stop-color="' . $c2 . '" stop-opacity="0.2"/>
			<stop offset="100%" stop-color="' . $c1 . '" stop-opacity="0.1"/>
		</linearGradient>
	</defs>
	<ellipse cx="300" cy="400" rx="400" ry="200" fill="url(#aurora1)" transform="rotate(-30 300 400)"/>
	<ellipse cx="800" cy="700" rx="450" ry="180" fill="url(#aurora1)" transform="rotate(20 800 700)"/>
	<ellipse cx="600" cy="300" rx="300" ry="250" fill="url(#aurora1)" transform="rotate(60 600 300)"/>';
}

function design_scattered_dots($c1, $c2) {
	$dots = '<g opacity="0.2">';
	for ($i = 0; $i < 150; $i++) {
		$x = rand(50, 1150);
		$y = rand(50, 1150);
		$r = rand(2, 12);
		$color = $i % 2 === 0 ? $c1 : $c2;
		$dots .= '<circle cx="' . $x . '" cy="' . $y . '" r="' . $r . '" fill="' . $color . '"/>';
	}
	$dots .= '</g>';
	return $dots;
}

function design_ribbon_twist($c1, $c2) {
	return '<g opacity="0.15" fill="none" stroke-width="40">
		<path d="M0,300 Q300,200 600,400 T1200,600" stroke="' . $c1 . '" opacity="0.3"/>
		<path d="M0,500 Q300,600 600,400 T1200,800" stroke="' . $c2 . '" opacity="0.3"/>
	</g>
	<circle cx="600" cy="600" r="180" fill="url(#g)" opacity="0.1" filter="url(#glow)"/>';
}

function generate_svg($title, $category, $destPath) {
	$colors = category_colors($category);
	$c1 = $colors[0];
	$c2 = $colors[1];
	$lines = simple_wrap($title, 18);
	$lineCount = count($lines);
	
	$fontSize = 108;
	if ($lineCount === 2) $fontSize = 100;
	if ($lineCount >= 3) $fontSize = 92;
	
	$startY = 600 - (($lineCount - 1) * ($fontSize + 10)) / 2;
	
	// Zufälliges Design auswählen (basierend auf Song-ID für Konsistenz) - 20 Varianten!
	$designs = [
		'design_neon_waves',
		'design_geometric_burst',
		'design_synthwave_grid',
		'design_abstract_flow',
		'design_particle_field',
		'design_gradient_rings',
		'design_digital_rain',
		'design_cosmic_blend',
		'design_hexagon_grid',
		'design_spiral_vortex',
		'design_wave_interference',
		'design_diamond_lattice',
		'design_starburst',
		'design_triangle_mosaic',
		'design_concentric_squares',
		'design_radial_burst',
		'design_sine_waves',
		'design_orbit_rings',
		'design_tech_grid',
		'design_slash_pattern',
		'design_crosshatch',
		'design_bubble_cluster',
		'design_zigzag_energy',
		'design_corner_accent',
		'design_diagonal_stripes',
		'design_pulse_circles',
		'design_fractal_tree',
		'design_sound_bars',
		'design_pixel_grid',
		'design_circuit_board',
		'design_aurora_flow',
		'design_scattered_dots',
		'design_ribbon_twist'
	];
	$designIndex = abs(crc32($title . $category)) % count($designs);
	$designFunc = $designs[$designIndex];
	$background = $designFunc($c1, $c2);
	
	$textElements = build_text_elements($lines, $startY, $fontSize, $c1, $c2);
	$catText = svg_escape(ucfirst($category));
	$bottomY = $startY + $lineCount * ($fontSize + 10) + 40;
	
	$svg = '<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1200" width="1200" height="1200">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="' . $c1 . '"/>
      <stop offset="100%" stop-color="' . $c2 . '"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="8" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <rect width="1200" height="1200" fill="#0B0F16"/>
  ' . $background . '
  ' . $textElements . '
  <text x="600" y="' . $bottomY . '" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="54" fill="#E5E7EB" opacity="0.85">
    Michael Ostermann · ' . $catText . '
  </text>
</svg>';
	
	$written = @file_put_contents($destPath, $svg, LOCK_EX);
	return $written !== false;
}

// Song-ID aus GET
$songId = isset($_GET['songId']) ? trim($_GET['songId']) : '';
if ($songId === '') {
	echo json_encode(['success' => false, 'error' => 'Keine songId']);
	exit;
}

if (!file_exists($tracksJson)) {
	echo json_encode(['success' => false, 'error' => 'tracks.json nicht gefunden']);
	exit;
}

$mainData = json_decode(@file_get_contents($tracksJson), true);
if (!is_array($mainData) || !isset($mainData['tracks'])) {
	echo json_encode(['success' => false, 'error' => 'Ungültige tracks.json']);
	exit;
}

$trackFound = null;
$trackIndex = -1;
foreach ($mainData['tracks'] as $idx => $track) {
	if (isset($track['id']) && $track['id'] === $songId) {
		$trackFound = $track;
		$trackIndex = $idx;
		break;
	}
}

if (!$trackFound) {
	echo json_encode(['success' => false, 'error' => 'Song nicht gefunden: ' . $songId]);
	exit;
}

$title = isset($trackFound['title']) ? $trackFound['title'] : 'Unbekannt';
$category = isset($trackFound['category']) ? $trackFound['category'] : 'gemischt';
$coverFilename = $songId . '.svg';
$coverPath = $coversDir . DIRECTORY_SEPARATOR . $coverFilename;

if (!generate_svg($title, $category, $coverPath)) {
	echo json_encode(['success' => false, 'error' => 'SVG konnte nicht geschrieben werden']);
	exit;
}

$newCoverPath = 'covers/' . $coverFilename;
$mainData['tracks'][$trackIndex]['cover'] = $newCoverPath;
$mainData['tracks'][$trackIndex]['coverGenerated'] = true;

$writeMain = @file_put_contents($tracksJson, json_encode($mainData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
if ($writeMain === false) {
	echo json_encode(['success' => false, 'error' => 'tracks.json konnte nicht aktualisiert werden']);
	exit;
}

$catJsonPath = $dataDir . DIRECTORY_SEPARATOR . $category . '.json';
if (file_exists($catJsonPath)) {
	$catData = json_decode(@file_get_contents($catJsonPath), true);
	if (is_array($catData) && isset($catData['tracks'])) {
		foreach ($catData['tracks'] as $idx => $track) {
			if (isset($track['id']) && $track['id'] === $songId) {
				$catData['tracks'][$idx]['cover'] = $newCoverPath;
				$catData['tracks'][$idx]['coverGenerated'] = true;
				@file_put_contents($catJsonPath, json_encode($catData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
				break;
			}
		}
	}
}

echo json_encode(['success' => true, 'cover' => $newCoverPath]);
exit;
